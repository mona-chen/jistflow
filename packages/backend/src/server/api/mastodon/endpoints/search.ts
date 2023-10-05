import Router from "@koa/router";
import { argsToBools, convertPaginationArgsIds, limitToInt, normalizeUrlQuery } from "./timeline.js";
import { convertSearchIds } from "../converters.js";
import authenticate from "@/server/api/authenticate.js";
import { UserHelpers } from "@/server/api/mastodon/helpers/user.js";
import { SearchHelpers } from "@/server/api/mastodon/helpers/search.js";

export function setupEndpointsSearch(router: Router): void {
    router.get("/v1/search", async (ctx) => {
        try {
            const auth = await authenticate(ctx.headers.authorization, null);
            const user = auth[0] ?? undefined;

            if (!user) {
                ctx.status = 401;
                return;
            }

            const args = normalizeUrlQuery(convertPaginationArgsIds(argsToBools(limitToInt(ctx.query), ['resolve', 'following', 'exclude_unreviewed'])));
            const cache = UserHelpers.getFreshAccountCache();
            const result = await SearchHelpers.search(user, args.q, args.type, args.resolve, args.following, args.account_id, args['exclude_unreviewed'], args.max_id, args.min_id, args.limit, args.offset, cache);

            ctx.body = {
                ...convertSearchIds(result),
                hashtags: result.hashtags.map(p => p.name),
            };
        } catch (e: any) {
            console.error(e);
            ctx.status = 400;
            ctx.body = {error: e.message};
        }
    });
    router.get("/v2/search", async (ctx) => {
        try {
            const auth = await authenticate(ctx.headers.authorization, null);
            const user = auth[0] ?? undefined;

            if (!user) {
                ctx.status = 401;
                return;
            }

            const args = normalizeUrlQuery(convertPaginationArgsIds(argsToBools(limitToInt(ctx.query), ['resolve', 'following', 'exclude_unreviewed'])));
            const cache = UserHelpers.getFreshAccountCache();
            const result = await SearchHelpers.search(user, args.q, args.type, args.resolve, args.following, args.account_id, args['exclude_unreviewed'], args.max_id, args.min_id, args.limit, args.offset, cache);

            ctx.body = convertSearchIds(result);
        } catch (e: any) {
            console.error(e);
            ctx.status = 400;
            ctx.body = {error: e.message};
        }
    });
}