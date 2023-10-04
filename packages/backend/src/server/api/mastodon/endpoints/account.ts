import Router from "@koa/router";
import { argsToBools, convertPaginationArgsIds, limitToInt, normalizeUrlQuery } from "./timeline.js";
import { convertId, IdType } from "../../index.js";
import { convertAccountId, convertListId, convertRelationshipId, convertStatusIds, } from "../converters.js";
import { getUser } from "@/server/api/common/getters.js";
import { UserConverter } from "@/server/api/mastodon/converters/user.js";
import authenticate from "@/server/api/authenticate.js";
import { NoteConverter } from "@/server/api/mastodon/converters/note.js";
import { UserHelpers } from "@/server/api/mastodon/helpers/user.js";
import { PaginationHelpers } from "@/server/api/mastodon/helpers/pagination.js";
import { ListHelpers } from "@/server/api/mastodon/helpers/list.js";

export function setupEndpointsAccount(router: Router): void {
    router.get("/v1/accounts/verify_credentials", async (ctx) => {
        try {
            const auth = await authenticate(ctx.headers.authorization, null);
            const user = auth[0] ?? null;

            if (!user) {
                ctx.status = 401;
                return;
            }

            const acct = await UserHelpers.verifyCredentials(user);
            ctx.body = convertAccountId(acct);
        } catch (e: any) {
            console.error(e);
            console.error(e.response.data);
            ctx.status = 401;
            ctx.body = e.response.data;
        }
    });
    router.patch("/v1/accounts/update_credentials", async (ctx) => {
        try {
            const auth = await authenticate(ctx.headers.authorization, null);
            const user = auth[0] ?? null;

            if (!user) {
                ctx.status = 401;
                return;
            }

            const acct = await UserHelpers.updateCredentials(user, (ctx.request as any).body as any);
            ctx.body = convertAccountId(acct)
        } catch (e: any) {
            console.error(e);
            console.error(e.response.data);
            ctx.status = 401;
            ctx.body = e.response.data;
        }
    });
    router.get("/v1/accounts/lookup", async (ctx) => {
        try {
            const args = normalizeUrlQuery(ctx.query);
            const user = await UserHelpers.getUserFromAcct(args.acct);
            if (user === null) {
                ctx.status = 404;
                return;
            }
            const account = await UserConverter.encode(user);
            ctx.body = convertAccountId(account);
        } catch (e: any) {
            console.error(e);
            console.error(e.response.data);
            ctx.status = 401;
            ctx.body = e.response.data;
        }
    });
    router.get("/v1/accounts/relationships", async (ctx) => {
        try {
            const auth = await authenticate(ctx.headers.authorization, null);
            const user = auth[0] ?? null;

            if (!user) {
                ctx.status = 401;
                return;
            }

            const ids = (normalizeUrlQuery(ctx.query, ['id[]'])['id[]'] ?? [])
                .map((id: string) => convertId(id, IdType.IceshrimpId));
            const result = await UserHelpers.getUserRelationhipToMany(ids, user.id);
            ctx.body = result.map(rel => convertRelationshipId(rel));
        } catch (e: any) {
            console.error(e);
            console.error(e.response.data);
            ctx.status = 401;
            ctx.body = e.response.data;
        }
    });
    router.get<{ Params: { id: string } }>("/v1/accounts/:id", async (ctx) => {
        try {
            const userId = convertId(ctx.params.id, IdType.IceshrimpId);
            const account = await UserConverter.encode(await getUser(userId));
            ctx.body = convertAccountId(account);
        } catch (e: any) {
            console.error(e);
            console.error(e.response.data);
            ctx.status = 401;
            ctx.body = e.response.data;
        }
    });
    router.get<{ Params: { id: string } }>(
        "/v1/accounts/:id/statuses",
        async (ctx) => {
            try {
                const auth = await authenticate(ctx.headers.authorization, null);
                const user = auth[0] ?? null;

                const userId = convertId(ctx.params.id, IdType.IceshrimpId);
                const cache = UserHelpers.getFreshAccountCache();
                const query = await UserHelpers.getUserCached(userId, cache);
                const args = normalizeUrlQuery(convertPaginationArgsIds(argsToBools(limitToInt(ctx.query))));
                const tl = await UserHelpers.getUserStatuses(query, user, args.max_id, args.since_id, args.min_id, args.limit, args['only_media'], args['exclude_replies'], args['exclude_reblogs'], args.pinned, args.tagged)
                    .then(n => NoteConverter.encodeMany(n, user, cache));

                ctx.body = tl.map(s => convertStatusIds(s));
            } catch (e: any) {
                console.error(e);
                console.error(e.response.data);
                ctx.status = 401;
                ctx.body = e.response.data;
            }
        },
    );
    router.get<{ Params: { id: string } }>(
        "/v1/accounts/:id/featured_tags",
        async (ctx) => {
            try {
                ctx.body = [];
            } catch (e: any) {
                ctx.status = 400;
                ctx.body = { error: e.message };
            }
        },
    );
    router.get<{ Params: { id: string } }>(
        "/v1/accounts/:id/followers",
        async (ctx) => {
            try {
                const auth = await authenticate(ctx.headers.authorization, null);
                const user = auth[0] ?? null;

                const userId = convertId(ctx.params.id, IdType.IceshrimpId);
                const cache = UserHelpers.getFreshAccountCache();
                const query = await UserHelpers.getUserCached(userId, cache);
                const args = normalizeUrlQuery(convertPaginationArgsIds(limitToInt(ctx.query as any)));

                const res = await UserHelpers.getUserFollowers(query, user, args.max_id, args.since_id, args.min_id, args.limit);
                const followers = await UserConverter.encodeMany(res.data, cache);

                ctx.body = followers.map((account) => convertAccountId(account));
                PaginationHelpers.appendLinkPaginationHeader(args, ctx, res, 40);
            } catch (e: any) {
                console.error(e);
                console.error(e.response.data);
                ctx.status = 401;
                ctx.body = e.response.data;
            }
        },
    );
    router.get<{ Params: { id: string } }>(
        "/v1/accounts/:id/following",
        async (ctx) => {
            try {
                const auth = await authenticate(ctx.headers.authorization, null);
                const user = auth[0] ?? null;

                const userId = convertId(ctx.params.id, IdType.IceshrimpId);
                const cache = UserHelpers.getFreshAccountCache();
                const query = await UserHelpers.getUserCached(userId, cache);
                const args = normalizeUrlQuery(convertPaginationArgsIds(limitToInt(ctx.query as any)));

                const res = await UserHelpers.getUserFollowing(query, user, args.max_id, args.since_id, args.min_id, args.limit);
                const following = await UserConverter.encodeMany(res.data, cache);

                ctx.body = following.map((account) => convertAccountId(account));
                PaginationHelpers.appendLinkPaginationHeader(args, ctx, res, 40);
            } catch (e: any) {
                console.error(e);
                console.error(e.response.data);
                ctx.status = 401;
                ctx.body = e.response.data;
            }
        },
    );
    router.get<{ Params: { id: string } }>(
        "/v1/accounts/:id/lists",
        async (ctx) => {
            try {
                const auth = await authenticate(ctx.headers.authorization, null);
                const user = auth[0] ?? null;

                if (!user) {
                    ctx.status = 401;
                    return;
                }

                const member = await UserHelpers.getUserCached(convertId(ctx.params.id, IdType.IceshrimpId));
                const results = await ListHelpers.getListsByMember(user, member);
                ctx.body = results.map(p => convertListId(p));
            } catch (e: any) {
                ctx.status = 400;
                ctx.body = { error: e.message };
            }
        },
    );
    router.post<{ Params: { id: string } }>(
        "/v1/accounts/:id/follow",
        async (ctx) => {
            try {
                const auth = await authenticate(ctx.headers.authorization, null);
                const user = auth[0] ?? null;

                if (!user) {
                    ctx.status = 401;
                    return;
                }

                const target = await UserHelpers.getUserCached(convertId(ctx.params.id, IdType.IceshrimpId));
                //FIXME: Parse form data
                const result = await UserHelpers.followUser(target, user, true, false);
                ctx.body = convertRelationshipId(result);
            } catch (e: any) {
                console.error(e);
                console.error(e.response.data);
                ctx.status = 401;
                ctx.body = e.response.data;
            }
        },
    );
    router.post<{ Params: { id: string } }>(
        "/v1/accounts/:id/unfollow",
        async (ctx) => {
            try {
                const auth = await authenticate(ctx.headers.authorization, null);
                const user = auth[0] ?? null;

                if (!user) {
                    ctx.status = 401;
                    return;
                }

                const target = await UserHelpers.getUserCached(convertId(ctx.params.id, IdType.IceshrimpId));
                const result = await UserHelpers.unfollowUser(target, user);
                ctx.body = convertRelationshipId(result);
            } catch (e: any) {
                console.error(e);
                console.error(e.response.data);
                ctx.status = 401;
                ctx.body = e.response.data;
            }
        },
    );
    router.post<{ Params: { id: string } }>(
        "/v1/accounts/:id/block",
        async (ctx) => {
            try {
                const auth = await authenticate(ctx.headers.authorization, null);
                const user = auth[0] ?? null;

                if (!user) {
                    ctx.status = 401;
                    return;
                }

                const target = await UserHelpers.getUserCached(convertId(ctx.params.id, IdType.IceshrimpId));
                const result = await UserHelpers.blockUser(target, user);
                ctx.body = convertRelationshipId(result);
            } catch (e: any) {
                console.error(e);
                console.error(e.response.data);
                ctx.status = 401;
                ctx.body = e.response.data;
            }
        },
    );
    router.post<{ Params: { id: string } }>(
        "/v1/accounts/:id/unblock",
        async (ctx) => {
            try {
                const auth = await authenticate(ctx.headers.authorization, null);
                const user = auth[0] ?? null;

                if (!user) {
                    ctx.status = 401;
                    return;
                }

                const target = await UserHelpers.getUserCached(convertId(ctx.params.id, IdType.IceshrimpId));
                const result = await UserHelpers.unblockUser(target, user);
                ctx.body = convertRelationshipId(result)
            } catch (e: any) {
                console.error(e);
                console.error(e.response.data);
                ctx.status = 401;
                ctx.body = e.response.data;
            }
        },
    );
    router.post<{ Params: { id: string } }>(
        "/v1/accounts/:id/mute",
        async (ctx) => {
            try {
                const auth = await authenticate(ctx.headers.authorization, null);
                const user = auth[0] ?? null;

                if (!user) {
                    ctx.status = 401;
                    return;
                }

                //FIXME: parse form data
                const args = normalizeUrlQuery(argsToBools(limitToInt(ctx.query, ['duration']), ['notifications']));
                const target = await UserHelpers.getUserCached(convertId(ctx.params.id, IdType.IceshrimpId));
                const result = await UserHelpers.muteUser(target, user, args.notifications, args.duration);
                ctx.body = convertRelationshipId(result)
            } catch (e: any) {
                console.error(e);
                console.error(e.response.data);
                ctx.status = 401;
                ctx.body = e.response.data;
            }
        },
    );
    router.post<{ Params: { id: string } }>(
        "/v1/accounts/:id/unmute",
        async (ctx) => {
            try {
                const auth = await authenticate(ctx.headers.authorization, null);
                const user = auth[0] ?? null;

                if (!user) {
                    ctx.status = 401;
                    return;
                }

                const target = await UserHelpers.getUserCached(convertId(ctx.params.id, IdType.IceshrimpId));
                const result = await UserHelpers.unmuteUser(target, user);
                ctx.body = convertRelationshipId(result)
            } catch (e: any) {
                console.error(e);
                console.error(e.response.data);
                ctx.status = 401;
                ctx.body = e.response.data;
            }
        },
    );
    router.get("/v1/featured_tags", async (ctx) => {
        try {
            ctx.body = [];
        } catch (e: any) {
            ctx.status = 400;
            ctx.body = { error: e.message };
        }
    });
    router.get("/v1/followed_tags", async (ctx) => {
        try {
            ctx.body = [];
        } catch (e: any) {
            ctx.status = 400;
            ctx.body = { error: e.message };
        }
    });
    router.get("/v1/bookmarks", async (ctx) => {
        try {
            const auth = await authenticate(ctx.headers.authorization, null);
            const user = auth[0] ?? null;

            if (!user) {
                ctx.status = 401;
                return;
            }

            const cache = UserHelpers.getFreshAccountCache();
            const args = normalizeUrlQuery(convertPaginationArgsIds(limitToInt(ctx.query as any)));
            const res = await UserHelpers.getUserBookmarks(user, args.max_id, args.since_id, args.min_id, args.limit);
            const bookmarks = await NoteConverter.encodeMany(res.data, user, cache);

            ctx.body = bookmarks.map(s => convertStatusIds(s));
            PaginationHelpers.appendLinkPaginationHeader(args, ctx, res, 20);
        } catch (e: any) {
            console.error(e);
            console.error(e.response.data);
            ctx.status = 401;
            ctx.body = e.response.data;
        }
    });
    router.get("/v1/favourites", async (ctx) => {
        try {
            const auth = await authenticate(ctx.headers.authorization, null);
            const user = auth[0] ?? null;

            if (!user) {
                ctx.status = 401;
                return;
            }

            const cache = UserHelpers.getFreshAccountCache();
            const args = normalizeUrlQuery(convertPaginationArgsIds(limitToInt(ctx.query as any)));
            const res = await UserHelpers.getUserFavorites(user, args.max_id, args.since_id, args.min_id, args.limit);
            const favorites = await NoteConverter.encodeMany(res.data, user, cache);

            ctx.body = favorites.map(s => convertStatusIds(s));
            PaginationHelpers.appendLinkPaginationHeader(args, ctx, res, 20);
        } catch (e: any) {
            console.error(e);
            console.error(e.response.data);
            ctx.status = 401;
            ctx.body = e.response.data;
        }
    });
    router.get("/v1/mutes", async (ctx) => {
        try {
            const auth = await authenticate(ctx.headers.authorization, null);
            const user = auth[0] ?? null;

            if (!user) {
                ctx.status = 401;
                return;
            }

            const cache = UserHelpers.getFreshAccountCache();
            const args = normalizeUrlQuery(convertPaginationArgsIds(limitToInt(ctx.query as any)));
            const res = await UserHelpers.getUserMutes(user, args.max_id, args.since_id, args.min_id, args.limit, cache);
            ctx.body = res.data.map(m => convertAccountId(m));
            PaginationHelpers.appendLinkPaginationHeader(args, ctx, res, 40);
        } catch (e: any) {
            console.error(e);
            console.error(e.response.data);
            ctx.status = 401;
            ctx.body = e.response.data;
        }
    });
    router.get("/v1/blocks", async (ctx) => {
        try {
            const auth = await authenticate(ctx.headers.authorization, null);
            const user = auth[0] ?? null;

            if (!user) {
                ctx.status = 401;
                return;
            }

            const cache = UserHelpers.getFreshAccountCache();
            const args = normalizeUrlQuery(convertPaginationArgsIds(limitToInt(ctx.query as any)));
            const res = await UserHelpers.getUserBlocks(user, args.max_id, args.since_id, args.min_id, args.limit);
            const blocks = await UserConverter.encodeMany(res.data, cache);
            ctx.body = blocks.map(b => convertAccountId(b));
            PaginationHelpers.appendLinkPaginationHeader(args, ctx, res, 40);
        } catch (e: any) {
            console.error(e);
            console.error(e.response.data);
            ctx.status = 401;
            ctx.body = e.response.data;
        }
    });
    router.get("/v1/follow_requests", async (ctx) => {
        try {
            const auth = await authenticate(ctx.headers.authorization, null);
            const user = auth[0] ?? null;

            if (!user) {
                ctx.status = 401;
                return;
            }

            const cache = UserHelpers.getFreshAccountCache();
            const args = normalizeUrlQuery(convertPaginationArgsIds(limitToInt(ctx.query as any)));
            const res = await UserHelpers.getUserFollowRequests(user, args.max_id, args.since_id, args.min_id, args.limit);
            const requests = await UserConverter.encodeMany(res.data, cache);
            ctx.body = requests.map(b => convertAccountId(b));
            PaginationHelpers.appendLinkPaginationHeader(args, ctx, res, 40);
        } catch (e: any) {
            console.error(e);
            console.error(e.response.data);
            ctx.status = 401;
            ctx.body = e.response.data;
        }
    });
    router.post<{ Params: { id: string } }>(
        "/v1/follow_requests/:id/authorize",
        async (ctx) => {
            try {
                const auth = await authenticate(ctx.headers.authorization, null);
                const user = auth[0] ?? null;

                if (!user) {
                    ctx.status = 401;
                    return;
                }

                const target = await UserHelpers.getUserCached(convertId(ctx.params.id, IdType.IceshrimpId));
                const result = await UserHelpers.acceptFollowRequest(target, user);
                ctx.body = convertRelationshipId(result);
            } catch (e: any) {
                console.error(e);
                console.error(e.response.data);
                ctx.status = 401;
                ctx.body = e.response.data;
            }
        },
    );
    router.post<{ Params: { id: string } }>(
        "/v1/follow_requests/:id/reject",
        async (ctx) => {
            try {
                const auth = await authenticate(ctx.headers.authorization, null);
                const user = auth[0] ?? null;

                if (!user) {
                    ctx.status = 401;
                    return;
                }

                const target = await UserHelpers.getUserCached(convertId(ctx.params.id, IdType.IceshrimpId));
                const result = await UserHelpers.rejectFollowRequest(target, user);
                ctx.body = convertRelationshipId(result);
            } catch (e: any) {
                console.error(e);
                console.error(e.response.data);
                ctx.status = 401;
                ctx.body = e.response.data;
            }
        },
    );
}
