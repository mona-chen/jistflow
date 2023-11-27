import Router from "@koa/router";
import { MiscHelpers } from "@/server/api/mastodon/helpers/misc.js";
import { argsToBools, limitToInt } from "@/server/api/mastodon/endpoints/timeline.js";
import { Announcements } from "@/models/index.js";
import { auth } from "@/server/api/mastodon/middleware/auth.js";
import { MastoApiError } from "@/server/api/mastodon/middleware/catch-errors.js";
import { filterContext } from "@/server/api/mastodon/middleware/filter-context.js";

export function setupEndpointsMisc(router: Router): void {
    router.get("/v1/custom_emojis",
        async (ctx) => {
            ctx.body = await MiscHelpers.getCustomEmoji();
        }
    );

    router.get("/v1/instance",
        async (ctx) => {
            ctx.body = await MiscHelpers.getInstance(ctx);
        }
    );

    router.get("/v1/announcements",
        auth(true),
        async (ctx) => {
            const args = argsToBools(ctx.query, ['with_dismissed']);
            ctx.body = await MiscHelpers.getAnnouncements(args['with_dismissed'], ctx);
        }
    );

    router.post<{ Params: { id: string } }>(
        "/v1/announcements/:id/dismiss",
        auth(true, ['write:accounts']),
        async (ctx) => {
            const announcement = await Announcements.findOneBy({ id: ctx.params.id });
            if (!announcement) throw new MastoApiError(404);

            await MiscHelpers.dismissAnnouncement(announcement, ctx);
            ctx.body = {};
        },
    );

    //FIXME: add link pagination to trends (ref: https://mastodon.social/api/v1/trends/tags?offset=10&limit=1)
    router.get(["/v1/trends/tags", "/v1/trends"],
        async (ctx) => {
            const args = limitToInt(ctx.query);
            ctx.body = await MiscHelpers.getTrendingHashtags(args.limit, args.offset);
            //FIXME: convert ids
        }
    );

    router.get("/v1/trends/statuses",
        filterContext('public'),
        async (ctx) => {
            const args = limitToInt(ctx.query);
            ctx.body = await MiscHelpers.getTrendingStatuses(args.limit, args.offset, ctx);
        }
    );

    router.get("/v1/trends/links",
        async (ctx) => {
            ctx.body = [];
        }
    );

    router.get("/v1/preferences",
        auth(true, ['read:accounts']),
        async (ctx) => {
            ctx.body = await MiscHelpers.getPreferences(ctx);
        }
    );

    router.get("/v2/suggestions",
        auth(true, ['read']),
        async (ctx) => {
            const args = limitToInt(ctx.query);
            ctx.body = await MiscHelpers.getFollowSuggestions(args.limit, ctx);
        }
    );
}
