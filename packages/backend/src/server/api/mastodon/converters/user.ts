import { User } from "@/models/entities/user.js";
import config from "@/config/index.js";
import { DriveFiles, UserProfiles, Users } from "@/models/index.js";
import { EmojiConverter } from "@/server/api/mastodon/converters/emoji.js";
import { populateEmojis } from "@/misc/populate-emojis.js";
import { escapeMFM } from "@/server/api/mastodon/converters/mfm.js";
import mfm from "mfm-js";
import { awaitAll } from "@/prelude/await-all.js";
import { AccountCache, UserHelpers } from "@/server/api/mastodon/helpers/user.js";
import { MfmHelpers } from "@/server/api/mastodon/helpers/mfm.js";

type Field = {
    name: string;
    value: string;
    verified?: boolean;
};

export class UserConverter {
    public static async encode(u: User, cache: AccountCache = UserHelpers.getFreshAccountCache()): Promise<MastodonEntity.Account> {
        return cache.locks.acquire(u.id, async () => {
            const cacheHit = cache.accounts.find(p => p.id == u.id);
            if (cacheHit) return cacheHit;

            let acct = u.username;
            let acctUrl = `https://${u.host || config.host}/@${u.username}`;
            if (u.host) {
                acct = `${u.username}@${u.host}`;
                acctUrl = `https://${u.host}/@${u.username}`;
            }
            const profile = UserProfiles.findOneBy({userId: u.id});
            const bio = profile.then(profile => MfmHelpers.toHtml(mfm.parse(profile?.description ?? "")) ?? escapeMFM(profile?.description ?? ""));
            const avatar = u.avatarId
                ? (DriveFiles.findOneBy({id: u.avatarId}))
                    .then(p => p?.url ?? Users.getIdenticonUrl(u.id))
                : Users.getIdenticonUrl(u.id);
            const banner = u.bannerId
                ? (DriveFiles.findOneBy({id: u.bannerId}))
                    .then(p => p?.url ?? `${config.url}/static-assets/transparent.png`)
                : `${config.url}/static-assets/transparent.png`;
            const followersCount = profile.then(profile => {
                if (profile === null) return u.followersCount;
                switch (profile.ffVisibility) {
                    case "public":
                        return u.followersCount;
                    case "followers":
                        // FIXME: check following relationship
                        return 0;
                    case "private":
                        return 0;
                }
            });
            const followingCount = profile.then(profile => {
                if (profile === null) return u.followingCount;
                switch (profile.ffVisibility) {
                    case "public":
                        return u.followingCount;
                    case "followers":
                        // FIXME: check following relationship
                        return 0;
                    case "private":
                        return 0;
                }
            });

            return awaitAll({
                id: u.id,
                username: u.username,
                acct: acct,
                display_name: u.name || u.username,
                locked: u.isLocked,
                created_at: u.createdAt.toISOString(),
                followers_count: followersCount,
                following_count: followingCount,
                statuses_count: u.notesCount,
                note: bio,
                url: u.uri ?? acctUrl,
                avatar: avatar,
                avatar_static: avatar,
                header: banner,
                header_static: banner,
                emojis: populateEmojis(u.emojis, u.host).then(emoji => emoji.map((e) => EmojiConverter.encode(e))),
                moved: null, //FIXME
                fields: profile.then(profile => profile?.fields.map(p => this.encodeField(p)) ?? []),
                bot: u.isBot,
                discoverable: u.isExplorable
            }).then(p => {
                cache.accounts.push(p);
                return p;
            });
        });
    }

    public static async encodeMany(users: User[], cache: AccountCache = UserHelpers.getFreshAccountCache()): Promise<MastodonEntity.Account[]> {
        const encoded = users.map(u => this.encode(u, cache));
        return Promise.all(encoded);
    }

    private static encodeField(f: Field): MastodonEntity.Field {
        return {
            name: f.name,
            value: MfmHelpers.toHtml(mfm.parse(f.value)) ?? escapeMFM(f.value),
            verified_at: f.verified ? (new Date()).toISOString() : null,
        }
    }
}
