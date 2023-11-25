import { ILocalUser, User } from "@/models/entities/user.js";
import config from "@/config/index.js";
import { DriveFiles, Followings, UserProfiles, Users } from "@/models/index.js";
import { EmojiConverter } from "@/server/api/mastodon/converters/emoji.js";
import { populateEmojis } from "@/misc/populate-emojis.js";
import { escapeMFM } from "@/server/api/mastodon/converters/mfm.js";
import mfm from "mfm-js";
import { awaitAll } from "@/prelude/await-all.js";
import { AccountCache, UserHelpers } from "@/server/api/mastodon/helpers/user.js";
import { MfmHelpers } from "@/server/api/mastodon/helpers/mfm.js";
import { MastoContext } from "@/server/api/mastodon/index.js";
import { IMentionedRemoteUsers } from "@/models/entities/note.js";
import { UserProfile } from "@/models/entities/user-profile.js";
import { In } from "typeorm";
import { unique } from "@/prelude/array.js";

type Field = {
    name: string;
    value: string;
    verified?: boolean;
};

export class UserConverter {
    public static async encode(u: User, ctx: MastoContext): Promise<MastodonEntity.Account> {
        const localUser = ctx.user as ILocalUser | null;
        const cache = ctx.cache as AccountCache;
        return cache.locks.acquire(u.id, async () => {
            const cacheHit = cache.accounts.find(p => p.id == u.id);
            if (cacheHit) return cacheHit;

            let fqn = `${u.username}@${u.host ?? config.domain}`;
            let acct = u.username;
            let acctUrl = `https://${u.host || config.host}/@${u.username}`;
            if (u.host) {
                acct = `${u.username}@${u.host}`;
                acctUrl = `https://${u.host}/@${u.username}`;
            }

            const aggregateProfile = (ctx.userProfileAggregate as Map<string, UserProfile | null>)?.get(u.id);

            const profile = aggregateProfile !== undefined
                ? aggregateProfile
                : UserProfiles.findOneBy({ userId: u.id });
            const bio = Promise.resolve(profile).then(profile => MfmHelpers.toHtml(mfm.parse(profile?.description ?? ""), profile?.mentions, u.host).then(p => p ?? escapeMFM(profile?.description ?? "")));
            const avatar = u.avatarId
                ? DriveFiles.getFinalUrlMaybe(u.avatarUrl) ?? (DriveFiles.findOneBy({ id: u.avatarId }))
                    .then(p => p?.url ?? Users.getIdenticonUrl(u.id))
					.then(p => DriveFiles.getFinalUrl(p))
                : Users.getIdenticonUrl(u.id);
            const banner = u.bannerId
                ? DriveFiles.getFinalUrlMaybe(u.bannerUrl) ?? (DriveFiles.findOneBy({ id: u.bannerId }))
					.then(p => p?.url ?? `${config.url}/static-assets/transparent.png`)
					.then(p => DriveFiles.getFinalUrl(p))
                : `${config.url}/static-assets/transparent.png`;

            const isFollowedOrSelf = (ctx.followedOrSelfAggregate as Map<string, boolean>)?.get(u.id)
                ?? (!!localUser &&
                    (localUser.id === u.id ||
                        Followings.exist({
                            where: {
                                followeeId: u.id,
                                followerId: localUser.id,
                            },
                        })
                    ));

            const followersCount = Promise.resolve(profile).then(async profile => {
                if (profile === null) return u.followersCount;
                switch (profile.ffVisibility) {
                    case "public":
                        return u.followersCount;
                    case "followers":
                        return Promise.resolve(isFollowedOrSelf).then(isFollowedOrSelf => isFollowedOrSelf ? u.followersCount : 0);
                    case "private":
                        return localUser?.id === profile.userId ? u.followersCount : 0;
                }
            });
            const followingCount = Promise.resolve(profile).then(async profile => {
                if (profile === null) return u.followingCount;
                switch (profile.ffVisibility) {
                    case "public":
                        return u.followingCount;
                    case "followers":
                        return Promise.resolve(isFollowedOrSelf).then(isFollowedOrSelf => isFollowedOrSelf ? u.followingCount : 0);
                    case "private":
                        return localUser?.id === profile.userId ? u.followingCount : 0;
                }
            });

            return awaitAll({
                id: u.id,
                username: u.username,
                acct: acct,
                fqn: fqn,
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
                fields: Promise.resolve(profile).then(profile => Promise.all(profile?.fields.map(async p => this.encodeField(p, u.host, profile?.mentions)) ?? [])),
                bot: u.isBot,
                discoverable: u.isExplorable
            }).then(p => {
                // noinspection ES6MissingAwait
                UserHelpers.updateUserInBackground(u);
                cache.accounts.push(p);
                return p;
            });
        });
    }

    public static async aggregateData(users: User[], ctx: MastoContext): Promise<void> {
        const user = ctx.user as ILocalUser | null;
        const targets = unique(users.map(u => u.id));

        const followedOrSelfAggregate = new Map<User["id"], boolean>();
        const userProfileAggregate = new Map<User["id"], UserProfile | null>();

        if (user) {
            const targetsWithoutSelf = targets.filter(u => u !== user.id);

            if (targetsWithoutSelf.length > 0) {
                const followings = await Followings.createQueryBuilder('following')
                    .select('following.followeeId')
                    .where('following.followerId = :meId', { meId: user.id })
                    .andWhere('following.followeeId IN (:...targets)', { targets: targetsWithoutSelf })
                    .getMany();

                for (const userId of targetsWithoutSelf) {
                    followedOrSelfAggregate.set(userId, !!followings.find(f => f.followerId === userId));
                }
            }

            followedOrSelfAggregate.set(user.id, true);
        }

        const profiles = await UserProfiles.findBy({
            userId: In(targets)
        });

        for (const userId of targets) {
            userProfileAggregate.set(userId, profiles.find(p => p.userId === userId) ?? null);
        }

        ctx.followedOrSelfAggregate = followedOrSelfAggregate;
    }

    public static async encodeMany(users: User[], ctx: MastoContext): Promise<MastodonEntity.Account[]> {
        await this.aggregateData(users, ctx);
        const encoded = users.map(u => this.encode(u, ctx));
        return Promise.all(encoded);
    }

    private static async encodeField(f: Field, host: string | null, mentions: IMentionedRemoteUsers): Promise<MastodonEntity.Field> {
        return {
            name: f.name,
            value: await MfmHelpers.toHtml(mfm.parse(f.value), mentions, host, true) ?? escapeMFM(f.value),
            verified_at: f.verified ? (new Date()).toISOString() : null,
        }
    }
}
