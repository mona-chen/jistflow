import Router from "@koa/router";
import { argsToBools, convertPaginationArgsIds, limitToInt, normalizeUrlQuery } from "./timeline.js";
import { convertSearchIds } from "../converters.js";
import { UserHelpers } from "@/server/api/mastodon/helpers/user.js";
import { SearchHelpers } from "@/server/api/mastodon/helpers/search.js";
import { auth } from "@/server/api/mastodon/middleware/auth.js";

export function setupEndpointsSearch(router: Router): void {
    router.get(["/v1/search", "/v2/search"],
        auth(true, ['read:search']),
        async (ctx) => {
            const args = normalizeUrlQuery(convertPaginationArgsIds(argsToBools(limitToInt(ctx.query), ['resolve', 'following', 'exclude_unreviewed'])));
            const cache = UserHelpers.getFreshAccountCache();
            const result = await SearchHelpers.search(ctx.user, args.q, args.type, args.resolve, args.following, args.account_id, args['exclude_unreviewed'], args.max_id, args.min_id, args.limit, args.offset, cache);

            ctx.body = convertSearchIds(result);

            if (ctx.path === "/v1/search") {
                ctx.body = {
                    ...ctx.body,
                    hashtags: result.hashtags.map(p => p.name),
                };
            }
        }
    );
}