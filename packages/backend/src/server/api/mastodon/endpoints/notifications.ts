import Router from "@koa/router";
import { convertId, IdType } from "../../index.js";
import { convertPaginationArgsIds, limitToInt, normalizeUrlQuery } from "./timeline.js";
import { convertNotificationIds } from "../converters.js";
import { NotificationHelpers } from "@/server/api/mastodon/helpers/notification.js";
import { NotificationConverter } from "@/server/api/mastodon/converters/notification.js";
import { auth } from "@/server/api/mastodon/middleware/auth.js";

export function setupEndpointsNotifications(router: Router): void {
    router.get("/v1/notifications",
        auth(true, ['read:notifications']),
        async (ctx) => {
            const args = normalizeUrlQuery(convertPaginationArgsIds(limitToInt(ctx.query)), ['types[]', 'exclude_types[]']);
            const res = await NotificationHelpers.getNotifications(ctx.user, args.max_id, args.since_id, args.min_id, args.limit, args['types[]'], args['exclude_types[]'], args.account_id);
            const data = await NotificationConverter.encodeMany(res.data, ctx.user, ctx);

            ctx.body = data.map(n => convertNotificationIds(n));
            ctx.pagination = res.pagination;
        }
    );

    router.get("/v1/notifications/:id",
        auth(true, ['read:notifications']),
        async (ctx) => {
            const notification = await NotificationHelpers.getNotificationOr404(convertId(ctx.params.id, IdType.IceshrimpId), ctx.user);
            ctx.body = convertNotificationIds(await NotificationConverter.encode(notification, ctx.user, ctx));
        }
    );

    router.post("/v1/notifications/clear",
        auth(true, ['write:notifications']),
        async (ctx) => {
            await NotificationHelpers.clearAllNotifications(ctx.user);
            ctx.body = {};
        }
    );

    router.post("/v1/notifications/:id/dismiss",
        auth(true, ['write:notifications']),
        async (ctx) => {
            const notification = await NotificationHelpers.getNotificationOr404(convertId(ctx.params.id, IdType.IceshrimpId), ctx.user);
            await NotificationHelpers.dismissNotification(notification.id, ctx.user);
            ctx.body = {};
        }
    );

    router.post("/v1/conversations/:id/read",
        auth(true, ['write:conversations']),
        async (ctx, reply) => {
            const id = convertId(ctx.params.id, IdType.IceshrimpId);
            await NotificationHelpers.markConversationAsRead(id, ctx.user);
            ctx.body = {};
        }
    );
}
