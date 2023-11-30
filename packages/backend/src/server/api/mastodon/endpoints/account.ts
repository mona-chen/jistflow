import Router from "@koa/router";
import { argsToBools, limitToInt, normalizeUrlQuery } from "./timeline.js";
import { UserConverter } from "@/server/api/mastodon/converters/user.js";
import { NoteConverter } from "@/server/api/mastodon/converters/note.js";
import { UserHelpers } from "@/server/api/mastodon/helpers/user.js";
import { ListHelpers } from "@/server/api/mastodon/helpers/list.js";
import { auth } from "@/server/api/mastodon/middleware/auth.js";
import { SearchHelpers } from "@/server/api/mastodon/helpers/search.js";
import { filterContext } from "@/server/api/mastodon/middleware/filter-context.js";

export function setupEndpointsAccount(router: Router): void {
    router.get("/v1/accounts/verify_credentials",
        auth(true, ['read:accounts']),
        async (ctx) => {
            ctx.body = await UserHelpers.verifyCredentials(ctx);
        }
    );
    router.patch("/v1/accounts/update_credentials",
        auth(true, ['write:accounts']),
        async (ctx) => {
            ctx.body = await UserHelpers.updateCredentials(ctx)
        }
    );
    router.get("/v1/accounts/lookup",
        async (ctx) => {
            const args = normalizeUrlQuery(ctx.query);
            const user = await UserHelpers.getUserFromAcct(args.acct);
            ctx.body = await UserConverter.encode(user, ctx);
        }
    );
    router.get("/v1/accounts/relationships",
        auth(true, ['read:follows']),
        async (ctx) => {
            const ids = normalizeUrlQuery(ctx.query, ['id[]'])['id[]']
				?? normalizeUrlQuery(ctx.query, ['id'])['id']
				?? [];
            ctx.body = await UserHelpers.getUserRelationhipToMany(ids, ctx.user.id);
        }
    );
    // This must come before /accounts/:id, otherwise that will take precedence
    router.get("/v1/accounts/search",
        auth(true, ['read:accounts']),
        async (ctx) => {
            const args = normalizeUrlQuery(argsToBools(limitToInt(ctx.query), ['resolve', 'following']));
            ctx.body = await SearchHelpers.search(args.q, 'accounts', args.resolve, args.following, undefined, false, undefined, undefined, args.limit, args.offset, ctx)
                .then(p => p.accounts);
        }
    );
    router.get<{ Params: { id: string } }>("/v1/accounts/:id",
        auth(false),
        async (ctx) => {
            ctx.body = await UserConverter.encode(await UserHelpers.getUserOr404(ctx.params.id), ctx);
        }
    );
    router.get<{ Params: { id: string } }>(
        "/v1/accounts/:id/statuses",
        auth(false, ["read:statuses"]),
        filterContext('account'),
        async (ctx) => {
            const query = await UserHelpers.getUserCachedOr404(ctx.params.id, ctx);
            const args = normalizeUrlQuery(argsToBools(limitToInt(ctx.query)));
            const res = await UserHelpers.getUserStatuses(query, args.max_id, args.since_id, args.min_id, args.limit, args['only_media'], args['exclude_replies'], args['exclude_reblogs'], args.pinned, args.tagged, ctx);
            ctx.body = await NoteConverter.encodeMany(res, ctx);
        },
    );
    router.get<{ Params: { id: string } }>(
        "/v1/accounts/:id/featured_tags",
        async (ctx) => {
            ctx.body = [];
        },
    );
    router.get<{ Params: { id: string } }>(
        "/v1/accounts/:id/followers",
        auth(false),
        async (ctx) => {
            const query = await UserHelpers.getUserCachedOr404(ctx.params.id, ctx);
            const args = normalizeUrlQuery(limitToInt(ctx.query as any));
            const res = await UserHelpers.getUserFollowers(query, args.max_id, args.since_id, args.min_id, args.limit, ctx);
            ctx.body = await UserConverter.encodeMany(res, ctx);
        },
    );
    router.get<{ Params: { id: string } }>(
        "/v1/accounts/:id/following",
        auth(false),
        async (ctx) => {
            const query = await UserHelpers.getUserCachedOr404(ctx.params.id, ctx);
            const args = normalizeUrlQuery(limitToInt(ctx.query as any));
            const res = await UserHelpers.getUserFollowing(query, args.max_id, args.since_id, args.min_id, args.limit, ctx);
            ctx.body = await UserConverter.encodeMany(res, ctx);
        },
    );
    router.get<{ Params: { id: string } }>(
        "/v1/accounts/:id/lists",
        auth(true, ["read:lists"]),
        async (ctx) => {
            const member = await UserHelpers.getUserCachedOr404(ctx.params.id, ctx);
            ctx.body = await ListHelpers.getListsByMember(member, ctx);
        },
    );
    router.post<{ Params: { id: string } }>(
        "/v1/accounts/:id/follow",
        auth(true, ["write:follows"]),
        async (ctx) => {
            const target = await UserHelpers.getUserCachedOr404(ctx.params.id, ctx);
            //FIXME: Parse form data
            ctx.body = await UserHelpers.followUser(target, true, false, ctx);
        },
    );
    router.post<{ Params: { id: string } }>(
        "/v1/accounts/:id/unfollow",
        auth(true, ["write:follows"]),
        async (ctx) => {
            const target = await UserHelpers.getUserCachedOr404(ctx.params.id, ctx);
            ctx.body = await UserHelpers.unfollowUser(target, ctx);
        },
    );
    router.post<{ Params: { id: string } }>(
        "/v1/accounts/:id/block",
        auth(true, ["write:blocks"]),
        async (ctx) => {
            const target = await UserHelpers.getUserCachedOr404(ctx.params.id, ctx);
            ctx.body = await UserHelpers.blockUser(target, ctx);
        },
    );
    router.post<{ Params: { id: string } }>(
        "/v1/accounts/:id/unblock",
        auth(true, ["write:blocks"]),
        async (ctx) => {
            const target = await UserHelpers.getUserCachedOr404(ctx.params.id, ctx);
            ctx.body = await UserHelpers.unblockUser(target, ctx);
        },
    );
    router.post<{ Params: { id: string } }>(
        "/v1/accounts/:id/mute",
        auth(true, ["write:mutes"]),
        async (ctx) => {
            //FIXME: parse form data
            const args = normalizeUrlQuery(argsToBools(limitToInt(ctx.query, ['duration']), ['notifications']));
            const target = await UserHelpers.getUserCachedOr404(ctx.params.id, ctx);
            ctx.body = await UserHelpers.muteUser(target, args.notifications, args.duration, ctx);
        },
    );
    router.post<{ Params: { id: string } }>(
        "/v1/accounts/:id/unmute",
        auth(true, ["write:mutes"]),
        async (ctx) => {
            const target = await UserHelpers.getUserCachedOr404(ctx.params.id, ctx);
            ctx.body = await UserHelpers.unmuteUser(target, ctx);
        },
    );
    router.get("/v1/featured_tags",
        async (ctx) => {
            ctx.body = [];
        }
    );
    router.get("/v1/followed_tags",
        async (ctx) => {
            ctx.body = [];
        }
    );
    router.get("/v1/bookmarks",
        auth(true, ["read:bookmarks"]),
        async (ctx) => {
            const args = normalizeUrlQuery(limitToInt(ctx.query as any));
            const res = await UserHelpers.getUserBookmarks(args.max_id, args.since_id, args.min_id, args.limit, ctx);
            ctx.body = await NoteConverter.encodeMany(res, ctx);
        }
    );
    router.get("/v1/favourites",
        auth(true, ["read:favourites"]),
        async (ctx) => {
            const args = normalizeUrlQuery(limitToInt(ctx.query as any));
            const res = await UserHelpers.getUserFavorites(args.max_id, args.since_id, args.min_id, args.limit, ctx);
            ctx.body = await NoteConverter.encodeMany(res, ctx);
        }
    );
    router.get("/v1/mutes",
        auth(true, ["read:mutes"]),
        async (ctx) => {
            const args = normalizeUrlQuery(limitToInt(ctx.query as any));
            ctx.body = await UserHelpers.getUserMutes(args.max_id, args.since_id, args.min_id, args.limit, ctx);
        }
    );
    router.get("/v1/blocks",
        auth(true, ["read:blocks"]),
        async (ctx) => {
            const args = normalizeUrlQuery(limitToInt(ctx.query as any));
            const res = await UserHelpers.getUserBlocks(args.max_id, args.since_id, args.min_id, args.limit, ctx);
            ctx.body = await UserConverter.encodeMany(res, ctx);
        }
    );
    router.get("/v1/follow_requests",
        auth(true, ["read:follows"]),
        async (ctx) => {
            const args = normalizeUrlQuery(limitToInt(ctx.query as any));
            const res = await UserHelpers.getUserFollowRequests(args.max_id, args.since_id, args.min_id, args.limit, ctx);
            ctx.body = await UserConverter.encodeMany(res, ctx);
        }
    );
    router.post<{ Params: { id: string } }>(
        "/v1/follow_requests/:id/authorize",
        auth(true, ["write:follows"]),
        async (ctx) => {
            const target = await UserHelpers.getUserCachedOr404(ctx.params.id, ctx);
            ctx.body = await UserHelpers.acceptFollowRequest(target, ctx);
        },
    );
    router.post<{ Params: { id: string } }>(
        "/v1/follow_requests/:id/reject",
        auth(true, ["write:follows"]),
        async (ctx) => {
            const target = await UserHelpers.getUserCachedOr404(ctx.params.id, ctx);
            ctx.body = await UserHelpers.rejectFollowRequest(target, ctx);
        },
    );
}
