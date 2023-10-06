import Router from "@koa/router";
import { MiscHelpers } from "@/server/api/mastodon/helpers/misc.js";
import { argsToBools, limitToInt } from "@/server/api/mastodon/endpoints/timeline.js";
import { Announcements } from "@/models/index.js";
import { convertAnnouncementId, convertSuggestionIds } from "@/server/api/mastodon/converters.js";
import { convertId, IdType } from "@/misc/convert-id.js";
import { auth } from "@/server/api/mastodon/middleware/auth.js";
import { MastoApiError } from "@/server/api/mastodon/middleware/catch-errors.js";

export function setupEndpointsMisc(router: Router): void {
    router.get("/v1/custom_emojis",
        async (ctx) => {
            ctx.body = await MiscHelpers.getCustomEmoji();
        }
    );

    router.get("/v1/instance",
        async (ctx) => {
            ctx.body = await MiscHelpers.getInstance();
        }
    );

    router.get("/v1/announcements",
        auth(true),
        async (ctx) => {
            const args = argsToBools(ctx.query, ['with_dismissed']);
            ctx.body = await MiscHelpers.getAnnouncements(ctx.user, args['with_dismissed'])
                .then(p => p.map(x => convertAnnouncementId(x)));
        }
    );

    router.post<{ Params: { id: string } }>(
        "/v1/announcements/:id/dismiss",
        auth(true, ['write:accounts']),
        async (ctx) => {
            const id = convertId(ctx.params.id, IdType.IceshrimpId);
            const announcement = await Announcements.findOneBy({ id: id });
            if (!announcement) throw new MastoApiError(404);

            await MiscHelpers.dismissAnnouncement(announcement, ctx.user);
            ctx.body = {};
        },
    );

    router.get(["/v1/trends/tags", "/v1/trends"],
        async (ctx) => {
            const args = limitToInt(ctx.query);
            ctx.body = await MiscHelpers.getTrendingHashtags(args.limit, args.offset);
        }
    );

    router.get("/v1/trends/statuses",
        async (ctx) => {
            const args = limitToInt(ctx.query);
            ctx.body = await MiscHelpers.getTrendingStatuses(args.limit, args.offset);
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
            ctx.body = await MiscHelpers.getPreferences(ctx.user);
        }
    );

    router.get("/v2/suggestions",
        auth(true, ['read']),
        async (ctx) => {
            const args = limitToInt(ctx.query);
            ctx.body = await MiscHelpers.getFollowSuggestions(ctx.user, args.limit)
                .then(p => p.map(x => convertSuggestionIds(x)));
        }
    );
}
