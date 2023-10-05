import Router from "@koa/router";
import { MiscHelpers } from "@/server/api/mastodon/helpers/misc.js";
import authenticate from "@/server/api/authenticate.js";
import { argsToBools, limitToInt } from "@/server/api/mastodon/endpoints/timeline.js";
import { Announcements } from "@/models/index.js";
import { convertAnnouncementId, convertSuggestionIds } from "@/server/api/mastodon/converters.js";
import { convertId, IdType } from "@/misc/convert-id.js";

export function setupEndpointsMisc(router: Router): void {
    router.get("/v1/custom_emojis", async (ctx) => {
        try {
            ctx.body = await MiscHelpers.getCustomEmoji();
        } catch (e: any) {
            ctx.status = 500;
            ctx.body = { error: e.message };
        }
    });

    router.get("/v1/instance", async (ctx) => {
        try {
            ctx.body = await MiscHelpers.getInstance();
        } catch (e: any) {
            console.error(e);
            ctx.status = 500;
            ctx.body = { error: e.message };
        }
    });

    router.get("/v1/announcements", async (ctx) => {
        try {
            const auth = await authenticate(ctx.headers.authorization, null);
            const user = auth[0] ?? null;

            if (!user) {
                ctx.status = 401;
                return;
            }

            const args = argsToBools(ctx.query, ['with_dismissed']);
            ctx.body = await MiscHelpers.getAnnouncements(user, args['with_dismissed'])
                .then(p => p.map(x => convertAnnouncementId(x)));
        } catch (e: any) {
            ctx.status = 500;
            ctx.body = { error: e.message };
        }
    });

    router.post<{ Params: { id: string } }>(
        "/v1/announcements/:id/dismiss",
        async (ctx) => {
            try {
                const auth = await authenticate(ctx.headers.authorization, null);
                const user = auth[0] ?? null;

                if (!user) {
                    ctx.status = 401;
                    return;
                }

                const id = convertId(ctx.params.id, IdType.IceshrimpId);
                const announcement = await Announcements.findOneBy({id: id});

                if (!announcement) {
                    ctx.status = 404;
                    return;
                }

                await MiscHelpers.dismissAnnouncement(announcement, user);
                ctx.body = {};
            } catch (e: any) {
                ctx.status = 500;
                ctx.body = { error: e.message };
            }
        },
    );

    router.get(["/v1/trends/tags", "/v1/trends"], async (ctx) => {
        try {
            const args = limitToInt(ctx.query);
            ctx.body = await MiscHelpers.getTrendingHashtags(args.limit, args.offset);
        } catch (e: any) {
            ctx.status = 500;
            ctx.body = { error: e.message };
        }
    });

    router.get("/v1/trends/statuses", async (ctx) => {
        try {
            const args = limitToInt(ctx.query);
            ctx.body = await MiscHelpers.getTrendingStatuses(args.limit, args.offset);
        } catch (e: any) {
            ctx.status = 500;
            ctx.body = { error: e.message };
        }
    });

    router.get("/v1/trends/links", async (ctx) => {
        ctx.body = [];
    });

    router.get("/v1/preferences", async (ctx) => {
        try {
            const auth = await authenticate(ctx.headers.authorization, null);
            const user = auth[0] ?? null;

            if (!user) {
                ctx.status = 401;
                return;
            }

            ctx.body = await MiscHelpers.getPreferences(user);
        } catch (e: any) {
            ctx.status = 500;
            ctx.body = { error: e.message };
        }
    });

    router.get("/v2/suggestions", async (ctx) => {
        try {
            const auth = await authenticate(ctx.headers.authorization, null);
            const user = auth[0] ?? undefined;

            if (!user) {
                ctx.status = 401;
                return;
            }

            const args = limitToInt(ctx.query);
            ctx.body = await MiscHelpers.getFollowSuggestions(user, args.limit)
                .then(p => p.map(x => convertSuggestionIds(x)));
        } catch (e: any) {
            ctx.status = 500;
            ctx.body = { error: e.message };
        }
    });
}
