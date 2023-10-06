import { DefaultContext } from "koa";
import Router, { RouterContext } from "@koa/router";
import { setupEndpointsAuth } from "./endpoints/auth.js";
import { setupEndpointsAccount } from "./endpoints/account.js";
import { setupEndpointsStatus } from "./endpoints/status.js";
import { setupEndpointsFilter } from "./endpoints/filter.js";
import { setupEndpointsTimeline } from "./endpoints/timeline.js";
import { setupEndpointsNotifications } from "./endpoints/notifications.js";
import { setupEndpointsSearch } from "./endpoints/search.js";
import { setupEndpointsMedia } from "@/server/api/mastodon/endpoints/media.js";
import { setupEndpointsMisc } from "@/server/api/mastodon/endpoints/misc.js";
import { setupEndpointsList } from "@/server/api/mastodon/endpoints/list.js";
import { AuthMiddleware } from "@/server/api/mastodon/middleware/auth.js";
import { CatchErrorsMiddleware } from "@/server/api/mastodon/middleware/catch-errors.js";
import { apiLogger } from "@/server/api/logger.js";
import { CacheMiddleware } from "@/server/api/mastodon/middleware/cache.js";
import { KoaBodyMiddleware } from "@/server/api/mastodon/middleware/koa-body.js";
import { NormalizeQueryMiddleware } from "@/server/api/mastodon/middleware/normalize-query.js";
import { PaginationMiddleware } from "@/server/api/mastodon/middleware/pagination.js";
import { SetHeadersMiddleware } from "@/server/api/mastodon/middleware/set-headers.js";

export const logger = apiLogger.createSubLogger("mastodon");
export type MastoContext = RouterContext & DefaultContext;

export function setupMastodonApi(router: Router): void {
    setupMiddleware(router);
    setupEndpointsAuth(router);
    setupEndpointsAccount(router);
    setupEndpointsStatus(router);
    setupEndpointsFilter(router);
    setupEndpointsTimeline(router);
    setupEndpointsNotifications(router);
    setupEndpointsSearch(router);
    setupEndpointsMedia(router);
    setupEndpointsList(router);
    setupEndpointsMisc(router);
}

function setupMiddleware(router: Router): void {
    router.use(KoaBodyMiddleware());
    router.use(SetHeadersMiddleware);
    router.use(CatchErrorsMiddleware);
    router.use(NormalizeQueryMiddleware);
    router.use(PaginationMiddleware);
    router.use(AuthMiddleware);
    router.use(CacheMiddleware);
}
