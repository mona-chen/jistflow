import Router from "@koa/router";
import { argsToBools, limitToInt, normalizeUrlQuery } from "./timeline.js";
import { SearchHelpers } from "@/server/api/mastodon/helpers/search.js";
import { auth } from "@/server/api/mastodon/middleware/auth.js";

export function setupEndpointsSearch(router: Router): void {
    router.get(["/v1/search", "/v2/search"],
        auth(true, ['read:search']),
        async (ctx) => {
            const args = normalizeUrlQuery(argsToBools(limitToInt(ctx.query), ['resolve', 'following', 'exclude_unreviewed']));
            ctx.body = await SearchHelpers.search(args.q, args.type, args.resolve, args.following, args.account_id, args['exclude_unreviewed'], args.max_id, args.min_id, args.limit, args.offset, ctx);

            if (ctx.path === "/v1/search") {
                ctx.body = {
                    ...ctx.body,
                    hashtags: ctx.body.hashtags.map((p: MastodonEntity.Tag) => p.name),
                };
            }
        }
    );
}
