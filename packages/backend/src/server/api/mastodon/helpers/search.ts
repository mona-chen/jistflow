import { Followings, Hashtags, Notes, Users } from "@/models/index.js";
import { sqlLikeEscape } from "@/misc/sql-like-escape.js";
import { generateVisibilityQuery } from "@/server/api/common/generate-visibility-query.js";
import { generateMutedUserQuery } from "@/server/api/common/generate-muted-user-query.js";
import { generateBlockedUserQuery } from "@/server/api/common/generate-block-query.js";
import { Note } from "@/models/entities/note.js";
import { PaginationHelpers } from "@/server/api/mastodon/helpers/pagination.js";
import { ILocalUser, User } from "@/models/entities/user.js";
import { Brackets, IsNull } from "typeorm";
import { awaitAll } from "@/prelude/await-all.js";
import { NoteConverter } from "@/server/api/mastodon/converters/note.js";
import Resolver from "@/remote/activitypub/resolver.js";
import { getApId, isActor, isPost } from "@/remote/activitypub/type.js";
import DbResolver from "@/remote/activitypub/db-resolver.js";
import { createPerson } from "@/remote/activitypub/models/person.js";
import { UserConverter } from "@/server/api/mastodon/converters/user.js";
import { resolveUser } from "@/remote/resolve-user.js";
import { createNote } from "@/remote/activitypub/models/note.js";
import config from "@/config/index.js";
import { logger, MastoContext } from "@/server/api/mastodon/index.js";
import { generateFtsQuery } from "@/server/api/common/generate-fts-query.js";

export class SearchHelpers {
    public static async search(q: string | undefined, type: string | undefined, resolve: boolean = false, following: boolean = false, accountId: string | undefined, excludeUnreviewed: boolean = false, maxId: string | undefined, minId: string | undefined, limit: number = 20, offset: number | undefined, ctx: MastoContext): Promise<MastodonEntity.Search> {
        if (q === undefined || q.trim().length === 0) throw new Error('Search query cannot be empty');
        if (limit > 40) limit = 40;
        const user = ctx.user as ILocalUser;
        const notes = type === 'statuses' || !type ? this.searchNotes(q, resolve, following, accountId, maxId, minId, limit, offset, ctx) : [];
        const users = type === 'accounts' || !type ? this.searchUsers(q, resolve, following, maxId, minId, limit, offset, ctx) : [];
        const tags = type === 'hashtags' || !type ? this.searchTags(q, excludeUnreviewed, limit, offset) : [];

        const result = {
            statuses: Promise.resolve(notes).then(p => NoteConverter.encodeMany(p, ctx)),
            accounts: Promise.resolve(users).then(p => UserConverter.encodeMany(p, ctx)),
            hashtags: Promise.resolve(tags)
        };

        return awaitAll(result);
    }

    private static async searchUsers(q: string, resolve: boolean, following: boolean, maxId: string | undefined, minId: string | undefined, limit: number, offset: number | undefined, ctx: MastoContext): Promise<User[]> {
        const user = ctx.user as ILocalUser;
        if (resolve) {
            try {
                if (q.startsWith('https://') || q.startsWith('http://')) {
                    // try resolving locally first
                    const dbResolver = new DbResolver();
                    const dbResult = await dbResolver.getUserFromApId(q);
                    if (dbResult) return [dbResult];

                    // ask remote
                    const resolver = new Resolver();
                    resolver.setUser(user);
                    const object = await resolver.resolve(q);
                    if (q !== object.id) {
                        const result = await dbResolver.getUserFromApId(getApId(object));
                        if (result) return [result];
                    }
                    return isActor(object) ? Promise.all([createPerson(getApId(object), resolver.reset())]) : [];
                } else {
                    let match = q.match(/^@?(?<user>[a-zA-Z0-9_]+)@(?<host>[a-zA-Z0-9-.]+\.[a-zA-Z0-9-]+)$/);
                    if (!match) match = q.match(/^@(?<user>[a-zA-Z0-9_]+)$/)
                    if (match) {
                        // check if user is already in database
                        const dbResult = await Users.findOneBy({
                            usernameLower: match.groups!.user.toLowerCase(),
                            host: match.groups?.host ?? IsNull()
                        });
                        if (dbResult) return [dbResult];

                        const result = await resolveUser(match.groups!.user.toLowerCase(), match.groups?.host ?? null);
                        if (result) return [result];

                        // no matches found
                        return [];
                    }
                }
            } catch (e: any) {
                console.log(`[mastodon-client] resolve user '${q}' failed: ${e.message}`);
                return [];
            }
        }

        const query = PaginationHelpers.makePaginationQuery(
            Users.createQueryBuilder("user"),
            undefined,
            minId,
            maxId,
        );

        if (following) {
            const followingQuery = Followings.createQueryBuilder("following")
                .select("following.followeeId")
                .where("following.followerId = :followerId", { followerId: user.id });

            query.andWhere(
                new Brackets((qb) => {
                    qb.where(`user.id IN (${followingQuery.getQuery()} UNION ALL VALUES (:meId))`, { meId: user.id });
                }),
            );
        }

        query.andWhere(
            new Brackets((qb) => {
                qb.where("user.name ILIKE :q", { q: `%${sqlLikeEscape(q)}%` });
                qb.orWhere("concat_ws('@', user.usernameLower, user.host) ILIKE :q", { q: `%${sqlLikeEscape(q)}%` });
            })
        );

        query.orderBy({ 'user.notesCount': 'DESC' });

        return query.skip(offset ?? 0).take(limit).getMany().then(p => minId ? p.reverse() : p);
    }

    private static async searchNotes(q: string, resolve: boolean, following: boolean, accountId: string | undefined, maxId: string | undefined, minId: string | undefined, limit: number, offset: number | undefined, ctx: MastoContext): Promise<Note[]> {
        if (accountId && following) throw new Error("The 'following' and 'accountId' parameters cannot be used simultaneously");
        const user = ctx.user as ILocalUser;

        if (resolve) {
            try {
                if (q.startsWith('https://') || q.startsWith('http://')) {
                    // try resolving locally first
                    const dbResolver = new DbResolver();
                    const dbResult = await dbResolver.getNoteFromApId(q);
                    if (dbResult) return [dbResult];

                    // ask remote
                    const resolver = new Resolver();
                    resolver.setUser(user);
                    const object = await resolver.resolve(q);
                    if (q !== object.id) {
                        const result = await dbResolver.getNoteFromApId(getApId(object));
                        if (result) return [result];
                    }

                    return isPost(object) ? createNote(getApId(object), resolver.reset(), true).then(p => p ? [p] : []) : [];
                }
            } catch (e: any) {
                logger.warn(`Resolving note '${q}' failed: ${e.message}`);
                return [];
            }
        }

        const query = PaginationHelpers.makePaginationQuery(
            Notes.createQueryBuilder("note"),
            undefined,
            minId,
            maxId,
        );

        if (accountId) {
            query.andWhere("note.userId = :userId", { userId: accountId });
        }

        if (following) {
            const followingQuery = Followings.createQueryBuilder("following")
                .select("following.followeeId")
                .where("following.followerId = :followerId", { followerId: user.id });

            query.andWhere(
                new Brackets((qb) => {
                    qb.where(`note.userId IN (${followingQuery.getQuery()} UNION ALL VALUES (:meId))`, { meId: user.id });
                }),
            )
        }

        query.leftJoinAndSelect("note.renote", "renote");

        generateFtsQuery(query, q);
        generateVisibilityQuery(query, user);

        if (!accountId) {
            generateMutedUserQuery(query, user);
            generateBlockedUserQuery(query, user);
        }

        query.setParameter("meId", user);

        return query.skip(offset ?? 0).take(limit).getMany().then(p => minId ? p.reverse() : p);
    }

    private static async searchTags(q: string, excludeUnreviewed: boolean, limit: number, offset: number | undefined): Promise<MastodonEntity.Tag[]> {
        const tags = Hashtags.createQueryBuilder('tag')
            .select('tag.name')
            .distinctOn(['tag.name'])
            .where("tag.name ILIKE :q", { q: `%${sqlLikeEscape(q)}%` })
            .orderBy({ 'tag.name': 'ASC' })
            .skip(offset ?? 0).take(limit).getMany();

        return tags.then(p => p.map(tag => {
            return {
                name: tag.name,
                url: `${config.url}/tags/${tag.name}`,
                history: null
            };
        }));
    }
}
