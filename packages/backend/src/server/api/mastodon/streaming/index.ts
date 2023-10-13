import type { EventEmitter } from "events";
import type * as websocket from "websocket";
import type { ILocalUser, User } from "@/models/entities/user.js";
import type { MastodonStream } from "./channel.js";
import { Blockings, Followings, Mutings, RenoteMutings, UserProfiles, } from "@/models/index.js";
import type { UserProfile } from "@/models/entities/user-profile.js";
import { StreamEventEmitter, StreamMessages } from "@/server/api/stream/types.js";
import { apiLogger } from "@/server/api/logger.js";
import { MastodonStreamUser } from "@/server/api/mastodon/streaming/channels/user.js";
import { MastodonStreamDirect } from "@/server/api/mastodon/streaming/channels/direct.js";
import { MastodonStreamPublic } from "@/server/api/mastodon/streaming/channels/public.js";
import { MastodonStreamList } from "@/server/api/mastodon/streaming/channels/list.js";
import { ParsedUrlQuery } from "querystring";
import { toSingleLast } from "@/prelude/array.js";
import { MastodonStreamTag } from "@/server/api/mastodon/streaming/channels/tag.js";
import { OAuthToken } from "@/models/entities/oauth-token.js";

const logger = apiLogger.createSubLogger("streaming").createSubLogger("mastodon");
const channels: Record<string, any> = {
    "user": MastodonStreamUser,
    "user:notification": MastodonStreamUser,
    "direct": MastodonStreamDirect,
    "list": MastodonStreamList,
    "public": MastodonStreamPublic,
    "public:media": MastodonStreamPublic,
    "public:local": MastodonStreamPublic,
    "public:local:media": MastodonStreamPublic,
    "public:remote": MastodonStreamPublic,
    "public:remote:media": MastodonStreamPublic,
    "public:allow_local_only": MastodonStreamPublic,
    "public:allow_local_only:media": MastodonStreamPublic,
    "hashtag": MastodonStreamTag,
    "hashtag:local": MastodonStreamTag,
}

export class MastodonStreamingConnection {
    public user?: ILocalUser;
    public userProfile?: UserProfile | null;
    public following: Set<User["id"]> = new Set();
    public muting: Set<User["id"]> = new Set();
    public renoteMuting: Set<User["id"]> = new Set();
    public blocking: Set<User["id"]> = new Set();
    public token?: OAuthToken;
    private wsConnection: websocket.connection;
    private channels: MastodonStream[] = [];
    public subscriber: StreamEventEmitter;

    constructor(
        wsConnection: websocket.connection,
        subscriber: EventEmitter,
        user: ILocalUser | null | undefined,
        token: OAuthToken | null | undefined,
        query: ParsedUrlQuery,
    ) {
        const channel = toSingleLast(query.stream);
        logger.debug(`New connection on channel: ${channel}`);
        this.wsConnection = wsConnection;
        this.subscriber = subscriber;
        if (user) this.user = user;
        if (token) this.token = token;

        this.onMessage = this.onMessage.bind(this);
        this.onUserEvent = this.onUserEvent.bind(this);

        this.wsConnection.on("message", this.onMessage);

        if (this.user) {
            this.updateFollowing();
            this.updateMuting();
            this.updateRenoteMuting();
            this.updateBlocking();
            this.updateUserProfile();

            this.subscriber.on(`user:${this.user.id}`, this.onUserEvent);
        }

        if (channel) {
            const list = toSingleLast(query.list);
            const tag = toSingleLast(query.tag);
            this.onMessage({
                type: "utf8",
                utf8Data: JSON.stringify({ stream: channel, type: "subscribe", list, tag }),
            });
        }
    }

    private onUserEvent(data: StreamMessages["user"]["payload"]) {
        switch (data.type) {
            case "follow":
                this.following.add(data.body.id);
                break;
            case "unfollow":
                this.following.delete(data.body.id);
                break;
            case "mute":
                this.muting.add(data.body.id);
                break;
            case "unmute":
                this.muting.delete(data.body.id);
                break;

            // TODO: renote mute events
            // TODO: block events

            case "updateUserProfile":
                this.userProfile = data.body;
                break;
            case "terminate":
                this.closeConnection();
                break;
            default:
                break;
        }
    }

    private async onMessage(data: websocket.Message) {
        if (data.type !== "utf8") return;
        if (data.utf8Data == null) return;

        let message: Record<string, any>;

        try {
            message = JSON.parse(data.utf8Data);
        } catch (e) {
            logger.error("Failed to parse json data, ignoring");
            return;
        }

        const { stream, type, list, tag } = message;

        if (!message.stream || !message.type) {
            logger.error("Invalid message received, ignoring");
            return;
        }

        if (list ?? tag)
            logger.info(`${type}: ${stream} ${list ?? tag}`);
        else
            logger.info(`${type}: ${stream}`);

        switch (type) {
            case "subscribe":
                this.connectChannel(stream, list, tag);
                break;
            case "unsubscribe":
                this.disconnectChannel(stream);
                break;
        }
    }

    public send(stream: string, event: string, payload: any) {
        const json = JSON.stringify({
            stream: [stream],
            event: event,
            payload: typeof payload === "string" ? payload : JSON.stringify(payload),
        })

        this.wsConnection.send(json);
    }

    public connectChannel(channel: string, list?: string, tag?: string) {
        if (!channels[channel]) {
            logger.info(`Ignoring connection to unknown channel ${channel}`);
            return;
        }
        if (channels[channel].requireCredential) {
            if (this.user == null) {
                logger.info(`Refusing connection to channel ${channel} without authentication, terminating connection`);
                this.closeConnection();
                return;
            } else if (!channels[channel].requiredScopes.every((p: string) => this.token?.scopes?.includes(p))) {
                logger.info(`Refusing connection to channel ${channel} without required OAuth scopes, terminating connection`);
                this.closeConnection();
                return;
            }
        }

        if (
            channels[channel].shouldShare &&
            this.channels.some((c) => c.chName === channel)
        ) {
            return;
        }

        let ch: MastodonStream;

        if (channel === "list") {
            ch = new channels[channel](this, channel, list);
        } else if (channel.startsWith("hashtag"))
            ch = new channels[channel](this, channel, tag);
        else
            ch = new channels[channel](this, channel);
        this.channels.push(ch);
        ch.init(null);
    }

    public disconnectChannel(channelName: string) {
        const channel = this.channels.find((c) => c.chName === channelName);

        if (channel) {
            if (channel.dispose) channel.dispose();
            this.channels = this.channels.filter((c) => c.chName !== channelName);
        }
    }

    private async updateFollowing() {
        const followings = await Followings.find({
            where: {
                followerId: this.user!.id,
            },
            select: ["followeeId"],
        });

        this.following = new Set<string>(followings.map((x) => x.followeeId));
    }

    private async updateMuting() {
        const mutings = await Mutings.find({
            where: {
                muterId: this.user!.id,
            },
            select: ["muteeId"],
        });

        this.muting = new Set<string>(mutings.map((x) => x.muteeId));
    }

    private async updateRenoteMuting() {
        const renoteMutings = await RenoteMutings.find({
            where: {
                muterId: this.user!.id,
            },
            select: ["muteeId"],
        });

        this.renoteMuting = new Set<string>(renoteMutings.map((x) => x.muteeId));
    }

    private async updateBlocking() {
        const blockings = await Blockings.find({
            where: {
                blockeeId: this.user!.id,
            },
            select: ["blockerId"],
        });

        this.blocking = new Set<string>(blockings.map((x) => x.blockerId));
    }

    private async updateUserProfile() {
        this.userProfile = await UserProfiles.findOneBy({
            userId: this.user!.id,
        });
    }

    public closeConnection() {
        this.wsConnection.close();
        this.dispose();
    }

    public dispose() {
        for (const c of this.channels.filter((c) => c.dispose)) {
            if (c.dispose) c.dispose();
        }
    }
}
