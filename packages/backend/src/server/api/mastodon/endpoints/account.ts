import Router from "@koa/router";
import { argsToBools, convertPaginationArgsIds, limitToInt, normalizeUrlQuery } from "./timeline.js";
import { convertId, IdType } from "../../index.js";
import { convertAccountId, convertListId, convertRelationshipId, convertStatusIds, } from "../converters.js";
import { UserConverter } from "@/server/api/mastodon/converters/user.js";
import { NoteConverter } from "@/server/api/mastodon/converters/note.js";
import { UserHelpers } from "@/server/api/mastodon/helpers/user.js";
import { PaginationHelpers } from "@/server/api/mastodon/helpers/pagination.js";
import { ListHelpers } from "@/server/api/mastodon/helpers/list.js";
import { Files } from "formidable";
import { auth } from "@/server/api/mastodon/middleware/auth.js";

export function setupEndpointsAccount(router: Router): void {
    router.get("/v1/accounts/verify_credentials",
        auth(true, ['read:accounts']),
        async (ctx) => {
            const acct = await UserHelpers.verifyCredentials(ctx.user);
            ctx.body = convertAccountId(acct);
        }
    );
    router.patch("/v1/accounts/update_credentials",
        auth(true, ['write:accounts']),
        async (ctx) => {
            const files = (ctx.request as any).files as Files | undefined;
            const acct = await UserHelpers.updateCredentials(ctx.user, (ctx.request as any).body as any, files);
            ctx.body = convertAccountId(acct)
        }
    );
    router.get("/v1/accounts/lookup",
        async (ctx) => {
            const args = normalizeUrlQuery(ctx.query);
            const user = await UserHelpers.getUserFromAcct(args.acct);
            const account = await UserConverter.encode(user);
            ctx.body = convertAccountId(account);
        }
    );
    router.get("/v1/accounts/relationships",
        auth(true, ['read:follows']),
        async (ctx) => {
            const ids = (normalizeUrlQuery(ctx.query, ['id[]'])['id[]'] ?? [])
                .map((id: string) => convertId(id, IdType.IceshrimpId));
            const result = await UserHelpers.getUserRelationhipToMany(ids, ctx.user.id);
            ctx.body = result.map(rel => convertRelationshipId(rel));
        }
    );
    router.get<{ Params: { id: string } }>("/v1/accounts/:id",
        auth(false),
        async (ctx) => {
            const userId = convertId(ctx.params.id, IdType.IceshrimpId);
            const account = await UserConverter.encode(await UserHelpers.getUserOr404(userId));
            ctx.body = convertAccountId(account);
        }
    );
    router.get<{ Params: { id: string } }>(
        "/v1/accounts/:id/statuses",
        auth(false, ["read:statuses"]),
        async (ctx) => {
            const userId = convertId(ctx.params.id, IdType.IceshrimpId);
            const query = await UserHelpers.getUserCachedOr404(userId, ctx.cache);
            const args = normalizeUrlQuery(convertPaginationArgsIds(argsToBools(limitToInt(ctx.query))));
            const tl = await UserHelpers.getUserStatuses(query, ctx.user, args.max_id, args.since_id, args.min_id, args.limit, args['only_media'], args['exclude_replies'], args['exclude_reblogs'], args.pinned, args.tagged)
                .then(n => NoteConverter.encodeMany(n, ctx.user, ctx.cache));

            ctx.body = tl.map(s => convertStatusIds(s));
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
            const userId = convertId(ctx.params.id, IdType.IceshrimpId);
            const query = await UserHelpers.getUserCachedOr404(userId, ctx.cache);
            const args = normalizeUrlQuery(convertPaginationArgsIds(limitToInt(ctx.query as any)));
            const res = await UserHelpers.getUserFollowers(query, ctx.user, args.max_id, args.since_id, args.min_id, args.limit);
            const followers = await UserConverter.encodeMany(res.data, ctx.cache);

            ctx.body = followers.map((account) => convertAccountId(account));
            ctx.pagination = res.pagination;
        },
    );
    router.get<{ Params: { id: string } }>(
        "/v1/accounts/:id/following",
        auth(false),
        async (ctx) => {
            const userId = convertId(ctx.params.id, IdType.IceshrimpId);
            const query = await UserHelpers.getUserCachedOr404(userId, ctx.cache);
            const args = normalizeUrlQuery(convertPaginationArgsIds(limitToInt(ctx.query as any)));
            const res = await UserHelpers.getUserFollowing(query, ctx.user, args.max_id, args.since_id, args.min_id, args.limit);
            const following = await UserConverter.encodeMany(res.data, ctx.cache);

            ctx.body = following.map((account) => convertAccountId(account));
            ctx.pagination = res.pagination;
        },
    );
    router.get<{ Params: { id: string } }>(
        "/v1/accounts/:id/lists",
        auth(true, ["read:lists"]),
        async (ctx) => {
            const member = await UserHelpers.getUserCachedOr404(convertId(ctx.params.id, IdType.IceshrimpId));
            const results = await ListHelpers.getListsByMember(ctx.user, member);
            ctx.body = results.map(p => convertListId(p));
        },
    );
    router.post<{ Params: { id: string } }>(
        "/v1/accounts/:id/follow",
        auth(true, ["write:follows"]),
        async (ctx) => {
            const target = await UserHelpers.getUserCachedOr404(convertId(ctx.params.id, IdType.IceshrimpId));
            //FIXME: Parse form data
            const result = await UserHelpers.followUser(target, ctx.user, true, false);
            ctx.body = convertRelationshipId(result);
        },
    );
    router.post<{ Params: { id: string } }>(
        "/v1/accounts/:id/unfollow",
        auth(true, ["write:follows"]),
        async (ctx) => {
            const target = await UserHelpers.getUserCachedOr404(convertId(ctx.params.id, IdType.IceshrimpId));
            const result = await UserHelpers.unfollowUser(target, ctx.user);
            ctx.body = convertRelationshipId(result);
        },
    );
    router.post<{ Params: { id: string } }>(
        "/v1/accounts/:id/block",
        auth(true, ["write:blocks"]),
        async (ctx) => {
            const target = await UserHelpers.getUserCachedOr404(convertId(ctx.params.id, IdType.IceshrimpId));
            const result = await UserHelpers.blockUser(target, ctx.user);
            ctx.body = convertRelationshipId(result);
        },
    );
    router.post<{ Params: { id: string } }>(
        "/v1/accounts/:id/unblock",
        auth(true, ["write:blocks"]),
        async (ctx) => {
            const target = await UserHelpers.getUserCachedOr404(convertId(ctx.params.id, IdType.IceshrimpId));
            const result = await UserHelpers.unblockUser(target, ctx.user);
            ctx.body = convertRelationshipId(result)
        },
    );
    router.post<{ Params: { id: string } }>(
        "/v1/accounts/:id/mute",
        auth(true, ["write:mutes"]),
        async (ctx) => {
            //FIXME: parse form data
            const args = normalizeUrlQuery(argsToBools(limitToInt(ctx.query, ['duration']), ['notifications']));
            const target = await UserHelpers.getUserCachedOr404(convertId(ctx.params.id, IdType.IceshrimpId));
            const result = await UserHelpers.muteUser(target, ctx.user, args.notifications, args.duration);
            ctx.body = convertRelationshipId(result)
        },
    );
    router.post<{ Params: { id: string } }>(
        "/v1/accounts/:id/unmute",
        auth(true, ["write:mutes"]),
        async (ctx) => {
            const target = await UserHelpers.getUserCachedOr404(convertId(ctx.params.id, IdType.IceshrimpId));
            const result = await UserHelpers.unmuteUser(target, ctx.user);
            ctx.body = convertRelationshipId(result)
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
            const args = normalizeUrlQuery(convertPaginationArgsIds(limitToInt(ctx.query as any)));
            const res = await UserHelpers.getUserBookmarks(ctx.user, args.max_id, args.since_id, args.min_id, args.limit);
            const bookmarks = await NoteConverter.encodeMany(res.data, ctx.user, ctx.cache);
            ctx.body = bookmarks.map(s => convertStatusIds(s));
            ctx.pagination = res.pagination;
        }
    );
    router.get("/v1/favourites",
        auth(true, ["read:favourites"]),
        async (ctx) => {
            const args = normalizeUrlQuery(convertPaginationArgsIds(limitToInt(ctx.query as any)));
            const res = await UserHelpers.getUserFavorites(ctx.user, args.max_id, args.since_id, args.min_id, args.limit);
            const favorites = await NoteConverter.encodeMany(res.data, ctx.user, ctx.cache);
            ctx.body = favorites.map(s => convertStatusIds(s));
            ctx.pagination = res.pagination;
        }
    );
    router.get("/v1/mutes",
        auth(true, ["read:mutes"]),
        async (ctx) => {
            const args = normalizeUrlQuery(convertPaginationArgsIds(limitToInt(ctx.query as any)));
            const res = await UserHelpers.getUserMutes(ctx.user, args.max_id, args.since_id, args.min_id, args.limit, ctx.cache);
            ctx.body = res.data.map(m => convertAccountId(m));
            ctx.pagination = res.pagination;
        }
    );
    router.get("/v1/blocks",
        auth(true, ["read:blocks"]),
        async (ctx) => {
            const args = normalizeUrlQuery(convertPaginationArgsIds(limitToInt(ctx.query as any)));
            const res = await UserHelpers.getUserBlocks(ctx.user, args.max_id, args.since_id, args.min_id, args.limit);
            const blocks = await UserConverter.encodeMany(res.data, ctx.cache);
            ctx.body = blocks.map(b => convertAccountId(b));
            ctx.pagination = res.pagination;
        }
    );
    router.get("/v1/follow_requests",
        auth(true, ["read:follows"]),
        async (ctx) => {
            const args = normalizeUrlQuery(convertPaginationArgsIds(limitToInt(ctx.query as any)));
            const res = await UserHelpers.getUserFollowRequests(ctx.user, args.max_id, args.since_id, args.min_id, args.limit);
            const requests = await UserConverter.encodeMany(res.data, ctx.cache);
            ctx.body = requests.map(b => convertAccountId(b));
            ctx.pagination = res.pagination;
        }
    );
    router.post<{ Params: { id: string } }>(
        "/v1/follow_requests/:id/authorize",
        auth(true, ["write:follows"]),
        async (ctx) => {
            const target = await UserHelpers.getUserCachedOr404(convertId(ctx.params.id, IdType.IceshrimpId));
            const result = await UserHelpers.acceptFollowRequest(target, ctx.user);
            ctx.body = convertRelationshipId(result);
        },
    );
    router.post<{ Params: { id: string } }>(
        "/v1/follow_requests/:id/reject",
        auth(true, ["write:follows"]),
        async (ctx) => {
            const target = await UserHelpers.getUserCachedOr404(convertId(ctx.params.id, IdType.IceshrimpId));
            const result = await UserHelpers.rejectFollowRequest(target, ctx.user);
            ctx.body = convertRelationshipId(result);
        },
    );
}
