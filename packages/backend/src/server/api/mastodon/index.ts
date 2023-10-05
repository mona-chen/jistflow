import Router from "@koa/router";
import { setupEndpointsAuth } from "./endpoints/auth.js";
import { setupEndpointsAccount } from "./endpoints/account.js";
import { setupEndpointsStatus } from "./endpoints/status.js";
import { setupEndpointsFilter } from "./endpoints/filter.js";
import { setupEndpointsTimeline } from "./endpoints/timeline.js";
import { setupEndpointsNotifications } from "./endpoints/notifications.js";
import { setupEndpointsSearch } from "./endpoints/search.js";
import { setupEndpointsMedia } from "@/server/api/mastodon/endpoints/media.js";
import { setupEndpointsMisc } from "@/server/api/mastodon/endpoints/misc.js";
import { HttpMethodEnum, koaBody } from "koa-body";
import multer from "@koa/multer";
import { setupEndpointsList } from "@/server/api/mastodon/endpoints/list.js";

export function setupMastodonApi(router: Router, fileRouter: Router, upload: multer.Instance): void {
    router.use(
        koaBody({
            multipart: true,
            urlencoded: true,
            parsedMethods: [HttpMethodEnum.POST, HttpMethodEnum.PUT, HttpMethodEnum.PATCH, HttpMethodEnum.DELETE] // dear god mastodon why
        }),
    );

    router.use(async (ctx, next) => {
        if (ctx.request.query) {
            if (!ctx.request.body || Object.keys(ctx.request.body).length === 0) {
                ctx.request.body = ctx.request.query;
            } else {
                ctx.request.body = {...ctx.request.body, ...ctx.request.query};
            }
        }
        await next();
    });

    setupEndpointsAuth(router);
    setupEndpointsAccount(router);
    setupEndpointsStatus(router);
    setupEndpointsFilter(router);
    setupEndpointsTimeline(router);
    setupEndpointsNotifications(router);
    setupEndpointsSearch(router);
    setupEndpointsMedia(router, fileRouter, upload);
    setupEndpointsList(router);
    setupEndpointsMisc(router);
}
