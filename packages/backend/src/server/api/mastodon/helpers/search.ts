import es from "@/db/elasticsearch.js";
import sonic from "@/db/sonic.js";
import meilisearch, { MeilisearchNote } from "@/db/meilisearch.js";
import { Followings, Hashtags, Notes, Users } from "@/models/index.js";
import { sqlLikeEscape } from "@/misc/sql-like-escape.js";
import { generateVisibilityQuery } from "@/server/api/common/generate-visibility-query.js";
import { generateMutedUserQuery } from "@/server/api/common/generate-muted-user-query.js";
import { generateBlockedUserQuery } from "@/server/api/common/generate-block-query.js";
import { Note } from "@/models/entities/note.js";
import { PaginationHelpers } from "@/server/api/mastodon/helpers/pagination.js";
import { ILocalUser, User } from "@/models/entities/user.js";
import { Brackets, In, IsNull } from "typeorm";
import { awaitAll } from "@/prelude/await-all.js";
import { NoteConverter } from "@/server/api/mastodon/converters/note.js";
import Resolver from "@/remote/activitypub/resolver.js";
import { getApId, isActor, isPost } from "@/remote/activitypub/type.js";
import DbResolver from "@/remote/activitypub/db-resolver.js";
import { createPerson } from "@/remote/activitypub/models/person.js";
import { UserConverter } from "@/server/api/mastodon/converters/user.js";
import { resolveUser } from "@/remote/resolve-user.js";
import { createNote } from "@/remote/activitypub/models/note.js";
import { getUser } from "@/server/api/common/getters.js";
import config from "@/config/index.js";
import { MastoContext } from "@/server/api/mastodon/index.js";

export class SearchHelpers {
    public static async search(user: ILocalUser, q: string | undefined, type: string | undefined, resolve: boolean = false, following: boolean = false, accountId: string | undefined, excludeUnreviewed: boolean = false, maxId: string | undefined, minId: string | undefined, limit: number = 20, offset: number | undefined, ctx: MastoContext): Promise<MastodonEntity.Search> {
        if (q === undefined || q.trim().length === 0) throw new Error('Search query cannot be empty');
        if (limit > 40) limit = 40;
        const notes = type === 'statuses' || !type ? this.searchNotes(user, q, resolve, following, accountId, maxId, minId, limit, offset) : [];
        const users = type === 'accounts' || !type ? this.searchUsers(user, q, resolve, following, maxId, minId, limit, offset) : [];
        const tags = type === 'hashtags' || !type ? this.searchTags(q, excludeUnreviewed, limit, offset) : [];

        const result = {
            statuses: Promise.resolve(notes).then(p => NoteConverter.encodeMany(p, user, ctx)),
            accounts: Promise.resolve(users).then(p => UserConverter.encodeMany(p, ctx)),
            hashtags: Promise.resolve(tags)
        };

        return awaitAll(result);
    }

    private static async searchUsers(user: ILocalUser, q: string, resolve: boolean, following: boolean, maxId: string | undefined, minId: string | undefined, limit: number, offset: number | undefined): Promise<User[]> {
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
                qb.orWhere("user.usernameLower ILIKE :q", { q: `%${sqlLikeEscape(q)}%` });
            })
        );

        query.orderBy({ 'user.notesCount': 'DESC' });

        return query.skip(offset ?? 0).take(limit).getMany().then(p => minId ? p.reverse() : p);
    }

    private static async searchNotes(user: ILocalUser, q: string, resolve: boolean, following: boolean, accountId: string | undefined, maxId: string | undefined, minId: string | undefined, limit: number, offset: number | undefined): Promise<Note[]> {
        if (accountId && following) throw new Error("The 'following' and 'accountId' parameters cannot be used simultaneously");

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
                console.log(`[mastodon-client] resolve note '${q}' failed: ${e.message}`);
                return [];
            }
        }

        // Try sonic search first, unless we have advanced filters
        if (sonic && !accountId && !following) {
            let start = offset ?? 0;
            const chunkSize = 100;

            // Use sonic to fetch and step through all search results that could match the requirements
            const ids = [];
            while (true) {
                const results = await sonic.search.query(
                    sonic.collection,
                    sonic.bucket,
                    q,
                    {
                        limit: chunkSize,
                        offset: start,
                    },
                );

                start += chunkSize;

                if (results.length === 0) {
                    break;
                }

                const res = results
                    .map((k) => JSON.parse(k))
                    .filter((key) => {
                        if (minId && key.id < minId) return false;
                        if (maxId && key.id > maxId) return false;
                        return true;
                    })
                    .map((key) => key.id);

                ids.push(...res);
            }

            // Sort all the results by note id DESC (newest first)
            ids.sort((a, b) => b - a);

            // Fetch the notes from the database until we have enough to satisfy the limit
            start = 0;
            const found = [];
            while (found.length < limit && start < ids.length) {
                const chunk = ids.slice(start, start + chunkSize);

                const query = Notes.createQueryBuilder("note")
                    .where({ id: In(chunk) })
                    .orderBy({ id: "DESC" })

                generateVisibilityQuery(query, user);

                if (!accountId) {
                    generateMutedUserQuery(query, user);
                    generateBlockedUserQuery(query, user);
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

                const notes: Note[] = await query.getMany();

                found.push(...notes);
                start += chunkSize;
            }

            // If we have more results than the limit, trim them
            if (found.length > limit) {
                found.length = limit;
            }

            return found;
        }
        // Try meilisearch next
        else if (meilisearch) {
            let start = 0;
            const chunkSize = 100;

            // Use meilisearch to fetch and step through all search results that could match the requirements
            const ids = [];
            if (accountId) {
                const acc = await getUser(accountId);
                const append = acc.host !== null ? `from:${acc.usernameLower}@${acc.host} ` : `from:${acc.usernameLower}`;
                q = append + q;
            }
            if (following) {
                q = `filter:following ${q}`;
            }
            while (true) {
                const results = await meilisearch.search(q, chunkSize, start, user);

                start += chunkSize;

                if (results.hits.length === 0) {
                    break;
                }

                //TODO test this, it's the same logic the mk api uses but it seems, we need to make .hits already be a MeilisearchNote[] instead of forcing type checks to pass
                const res = (results.hits as MeilisearchNote[])
                    .filter((key: MeilisearchNote) => {
                        if (accountId && key.userId !== accountId) return false;
                        if (minId && key.id < minId) return false;
                        if (maxId && key.id > maxId) return false;
                        return true;
                    })
                    .map((key) => key.id);

                ids.push(...res);
            }

            // Sort all the results by note id DESC (newest first)
            //FIXME: fix this sort function (is it even necessary?)
            //ids.sort((a, b) => b - a);

            // Fetch the notes from the database until we have enough to satisfy the limit
            start = 0;
            const found = [];
            while (found.length < limit && start < ids.length) {
                const chunk = ids.slice(start, start + chunkSize);

                const query = Notes.createQueryBuilder("note")
                    .where({ id: In(chunk) })
                    .orderBy({ id: "DESC" })

                generateVisibilityQuery(query, user);

                if (!accountId) {
                    generateMutedUserQuery(query, user);
                    generateBlockedUserQuery(query, user);
                }

                const notes: Note[] = await query.getMany();

                found.push(...notes);
                start += chunkSize;
            }

            // If we have more results than the limit, trim them
            if (found.length > limit) {
                found.length = limit;
            }

            return found;
        } else if (es) {
            const userQuery =
                accountId != null
                    ? [
                        {
                            term: {
                                userId: accountId,
                            },
                        },
                    ]
                    : [];

            const result = await es.search({
                index: config.elasticsearch.index || "misskey_note",
                body: {
                    size: limit,
                    from: offset,
                    query: {
                        bool: {
                            must: [
                                {
                                    simple_query_string: {
                                        fields: ["text"],
                                        query: q.toLowerCase(),
                                        default_operator: "and",
                                    },
                                },
                                ...userQuery,
                            ],
                        },
                    },
                    sort: [
                        {
                            _doc: "desc",
                        },
                    ],
                },
            });

            const hits = result.body.hits.hits.map((hit: any) => hit._id);

            if (hits.length === 0) return [];

            // Fetch found notes
            const notes = await Notes.find({
                where: {
                    id: In(hits),
                },
                order: {
                    id: -1,
                },
            });

            //TODO: test this
            //FIXME: implement pagination
            return notes;
        }

        // Fallback to database query
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

        query
            .andWhere("note.text ILIKE :q", { q: `%${sqlLikeEscape(q)}%` })
            .leftJoinAndSelect("note.renote", "renote");


        generateVisibilityQuery(query, user);

        if (!accountId) {
            generateMutedUserQuery(query, user);
            generateBlockedUserQuery(query, user);
        }

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
