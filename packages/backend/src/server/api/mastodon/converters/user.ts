import { ILocalUser, User } from "@/models/entities/user.js";
import config from "@/config/index.js";
import { DriveFiles, Followings, HtmlUserCacheEntries, UserProfiles, Users } from "@/models/index.js";
import { EmojiConverter } from "@/server/api/mastodon/converters/emoji.js";
import { populateEmojis } from "@/misc/populate-emojis.js";
import { escapeMFM } from "@/server/api/mastodon/converters/mfm.js";
import mfm from "mfm-js";
import { awaitAll } from "@/prelude/await-all.js";
import { AccountCache, UserHelpers } from "@/server/api/mastodon/helpers/user.js";
import { MfmHelpers } from "@/server/api/mastodon/helpers/mfm.js";
import { MastoContext } from "@/server/api/mastodon/index.js";
import { IMentionedRemoteUsers, Note } from "@/models/entities/note.js";
import { UserProfile } from "@/models/entities/user-profile.js";
import { In } from "typeorm";
import { unique } from "@/prelude/array.js";
import { Cache } from "@/misc/cache.js";
import { getUser } from "../../common/getters.js";
import { HtmlUserCacheEntry } from "@/models/entities/html-user-cache-entry.js";
import AsyncLock from "async-lock";

type Field = {
    name: string;
    value: string;
    verified?: boolean;
};

export class UserConverter {
    private static userBioHtmlCache = new Cache<string | null>('html:user:bio', config.htmlCache?.ttlSeconds ?? 60 * 60);
    private static userFieldsHtmlCache = new Cache<MastodonEntity.Field[]>('html:user:fields', config.htmlCache?.ttlSeconds ?? 60 * 60);

    public static async encode(u: User, ctx: MastoContext): Promise<MastodonEntity.Account> {
        const localUser = ctx.user as ILocalUser | null;
        const cache = ctx.cache as AccountCache;
        return cache.locks.acquire(u.id, async () => {
            const cacheHit = cache.accounts.find(p => p.id == u.id);
            if (cacheHit) return cacheHit;

            const identifier = `${u.id}:${(u.lastFetchedAt ?? u.createdAt).getTime()}`;
            let fqn = `${u.username}@${u.host ?? config.domain}`;
            let acct = u.username;
            let acctUrl = `https://${u.host || config.host}/@${u.username}`;
            if (u.host) {
                acct = `${u.username}@${u.host}`;
                acctUrl = `https://${u.host}/@${u.username}`;
            }

            const aggregateProfile = (ctx.userProfileAggregate as Map<string, UserProfile | null>)?.get(u.id);

            let htmlCacheEntry: HtmlUserCacheEntry | null | undefined = undefined;
            const htmlCacheEntryLock = new AsyncLock();

            const profile = aggregateProfile !== undefined
                ? aggregateProfile
                : UserProfiles.findOneBy({ userId: u.id });
            const bio = this.userBioHtmlCache.fetch(identifier, async () => {
                return htmlCacheEntryLock.acquire(u.id, async () => {
                    if (htmlCacheEntry === undefined) htmlCacheEntry = await this.fetchFromCacheWithFallback(u, await profile, ctx);
                    if (htmlCacheEntry === null) {
                        return Promise.resolve(profile).then(async profile => {
                            return MfmHelpers.toHtml(mfm.parse(profile?.description ?? ""), profile?.mentions, u.host)
                                .then(p => p ?? escapeMFM(profile?.description ?? ""))
                                .then(p => p !== '<p></p>' ? p : null)
                        });
                    }
                    return htmlCacheEntry?.bio ?? null;
                });
            }, true)
                .then(p => p ?? '<p></p>');

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

            const fields =
                this.userFieldsHtmlCache.fetch(identifier, async () => {
                    return htmlCacheEntryLock.acquire(u.id, async () => {
                        if (htmlCacheEntry === undefined) htmlCacheEntry = await this.fetchFromCacheWithFallback(u, await profile, ctx);
                        if (htmlCacheEntry === null) {
                            return Promise.resolve(profile).then(profile => Promise.all(profile?.fields.map(async p => this.encodeField(p, u.host, profile?.mentions)) ?? []));
                        }
                        return htmlCacheEntry?.fields ?? [];
                    });
                }, true);

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
                fields: fields,
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
        const htmlUserCacheAggregate = ctx.htmlUserCacheAggregate ?? new Map<Note["id"], HtmlUserCacheEntry | null>();

        if (config.htmlCache?.dbFallback) {
            const htmlUserCacheEntries = await HtmlUserCacheEntries.findBy({
                userId: In(targets)
            });

            for (const target of targets) {
                htmlUserCacheAggregate.set(target, htmlUserCacheEntries.find(n => n.userId === target) ?? null);
            }
        }

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
        ctx.htmlUserCacheAggregate = htmlUserCacheAggregate;
    }

    public static async aggregateDataByIds(userIds: User["id"][], ctx: MastoContext): Promise<void> {
        const targets = unique(userIds);
        const htmlUserCacheAggregate = ctx.htmlUserCacheAggregate ?? new Map<Note["id"], HtmlUserCacheEntry | null>();

        if (config.htmlCache?.dbFallback) {
            const htmlUserCacheEntries = await HtmlUserCacheEntries.findBy({
                userId: In(targets)
            });

            for (const target of targets) {
                htmlUserCacheAggregate.set(target, htmlUserCacheEntries.find(n => n.userId === target) ?? null);
            }
        }

        ctx.htmlUserCacheAggregate = htmlUserCacheAggregate;
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

    private static async fetchFromCacheWithFallback(user: User, profile: UserProfile | null, ctx: MastoContext): Promise<HtmlUserCacheEntry | null> {
        if (!config.htmlCache?.dbFallback) return null;

        let dbHit: HtmlUserCacheEntry | Promise<HtmlUserCacheEntry | null> | null | undefined = (ctx.htmlUserCacheAggregate as Map<string, HtmlUserCacheEntry | null> | undefined)?.get(user.id);
        if (dbHit === undefined) dbHit = HtmlUserCacheEntries.findOneBy({ userId: user.id });

        return Promise.resolve(dbHit)
            .then(res => {
                if (res === null || (res.updatedAt.getTime() !== (user.lastFetchedAt ?? user.createdAt).getTime())) {
                    return this.dbCacheMiss(user, profile, ctx);
                }
                return res;
            });
    }

	private static async dbCacheMiss(user: User, profile: UserProfile | null, ctx: MastoContext): Promise<HtmlUserCacheEntry | null> {
		const identifier = `${user.id}:${(user.lastFetchedAt ?? user.createdAt).getTime()}`;
		const cache = ctx.cache as AccountCache;
		return cache.locks.acquire(identifier, async () => {
			const cachedBio = await this.userBioHtmlCache.get(identifier);
			const cachedFields = await this.userFieldsHtmlCache.get(identifier);
			if (cachedBio !== undefined && cachedFields !== undefined) {
				return { bio: cachedBio, fields: cachedFields } as HtmlUserCacheEntry;
			}

			if (profile === undefined) {
				profile = await UserProfiles.findOneBy({ userId: user.id });
			}

			let bio: string | null | Promise<string | null> | undefined = cachedBio;
			let fields: MastodonEntity.Field[] | Promise<MastodonEntity.Field[]> | undefined = cachedFields;

			if (bio === undefined) {
				bio = MfmHelpers.toHtml(mfm.parse(profile?.description ?? ""), profile?.mentions, user.host)
					.then(p => p ?? escapeMFM(profile?.description ?? ""))
					.then(p => p !== '<p></p>' ? p : null);
			}

			if (fields === undefined) {
				fields = Promise.all(profile!.fields.map(async p => this.encodeField(p, user.host, profile!.mentions)) ?? []);
			}

			HtmlUserCacheEntries.upsert({ userId: user.id, updatedAt: user.lastFetchedAt ?? user.createdAt, bio: await bio, fields: await fields }, ["userId"]);

			await this.userBioHtmlCache.set(identifier, await bio);
			await this.userFieldsHtmlCache.set(identifier, await fields);

			return { bio, fields } as HtmlUserCacheEntry;
		});
	}

    public static async prewarmCache(user: User, profile?: UserProfile | null, oldProfile?: UserProfile | null): Promise<void> {
        const identifier = `${user.id}:${(user.lastFetchedAt ?? user.createdAt).getTime()}`;
        if (profile !== null) {
			if (config.htmlCache?.dbFallback) {
				if (profile === undefined) {
					profile = await UserProfiles.findOneBy({ userId: user.id });
				}
				if (oldProfile !== undefined && profile?.fields === oldProfile?.fields && profile?.description === oldProfile?.description) {
					HtmlUserCacheEntries.update({ userId: user.id }, { updatedAt: user.lastFetchedAt ?? user.createdAt });
					return;
				}
			}

			if (!config.htmlCache?.prewarm) return;

			if (profile === undefined) {
				profile = await UserProfiles.findOneBy({ userId: user.id });
			}

            if (await this.userBioHtmlCache.get(identifier) === undefined) {
                const bio = MfmHelpers.toHtml(mfm.parse(profile?.description ?? ""), profile?.mentions, user.host)
                    .then(p => p ?? escapeMFM(profile?.description ?? ""))
                    .then(p => p !== '<p></p>' ? p : null);

                this.userBioHtmlCache.set(identifier, await bio);

                if (config.htmlCache?.dbFallback)
                    HtmlUserCacheEntries.upsert({ userId: user.id, updatedAt: user.lastFetchedAt ?? user.createdAt, bio: await bio }, ["userId"]);
            }

            if (await this.userFieldsHtmlCache.get(identifier) === undefined) {
                const fields = await Promise.all(profile!.fields.map(async p => this.encodeField(p, user.host, profile!.mentions)) ?? []);
                this.userFieldsHtmlCache.set(identifier, fields);

                if (config.htmlCache?.dbFallback)
                    HtmlUserCacheEntries.upsert({ userId: user.id, updatedAt: user.lastFetchedAt ?? user.createdAt, fields: fields }, ["userId"]);
            }
        }
    }

    public static async prewarmCacheById(userId: string, oldProfile?: UserProfile | null): Promise<void> {
        await this.prewarmCache(await getUser(userId), undefined, oldProfile);
    }
}
