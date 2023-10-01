import Router from "@koa/router";
import megalodon, { MegalodonInterface } from "megalodon";
import { setupEndpointsAuth } from "./endpoints/auth.js";
import { setupEndpointsAccount } from "./endpoints/account.js";
import { setupEndpointsStatus } from "./endpoints/status.js";
import { setupEndpointsFilter } from "./endpoints/filter.js";
import { setupEndpointsTimeline } from "./endpoints/timeline.js";
import { setupEndpointsNotifications } from "./endpoints/notifications.js";
import { setupEndpointsSearch } from "./endpoints/search.js";
import { setupEndpointsMedia } from "@/server/api/mastodon/endpoints/media.js";
import { setupEndpointsMisc } from "@/server/api/mastodon/endpoints/misc.js";
import { koaBody } from "koa-body";
import multer from "@koa/multer";
import { setupEndpointsList } from "@/server/api/mastodon/endpoints/list.js";

export function getClient(
	BASE_URL: string,
	authorization: string | undefined,
): MegalodonInterface {
	const accessTokenArr = authorization?.split(" ") ?? [null];
	const accessToken = accessTokenArr[accessTokenArr.length - 1];
	const generator = (megalodon as any).default;
	const client = generator(BASE_URL, accessToken) as MegalodonInterface;
	return client;
}

export function setupMastodonApi(router: Router, fileRouter: Router, upload: multer.Instance): void {
	router.use(
		koaBody({
			multipart: true,
			urlencoded: true,
		}),
	);

	router.use(async (ctx, next) => {
		if (ctx.request.query) {
			if (!ctx.request.body || Object.keys(ctx.request.body).length === 0) {
				ctx.request.body = ctx.request.query;
			} else {
				ctx.request.body = { ...ctx.request.body, ...ctx.request.query };
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
