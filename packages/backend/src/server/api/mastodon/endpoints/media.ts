import Router from "@koa/router";
import { getClient } from "@/server/api/mastodon/index.js";
import { convertId, IdType } from "@/misc/convert-id.js";
import { convertAttachment } from "@/server/api/mastodon/converters.js";
import multer from "@koa/multer";

export function setupEndpointsMedia(router: Router, fileRouter: Router, upload: multer.Instance): void {
	router.get<{ Params: { id: string } }>("/v1/media/:id", async (ctx) => {
		const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
		const accessTokens = ctx.headers.authorization;
		const client = getClient(BASE_URL, accessTokens);
		try {
			const data = await client.getMedia(
				convertId(ctx.params.id, IdType.IceshrimpId),
			);
			ctx.body = convertAttachment(data.data);
		} catch (e: any) {
			console.error(e);
			ctx.status = 401;
			ctx.body = e.response.data;
		}
	});
	router.put<{ Params: { id: string } }>("/v1/media/:id", async (ctx) => {
		const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
		const accessTokens = ctx.headers.authorization;
		const client = getClient(BASE_URL, accessTokens);
		try {
			const data = await client.updateMedia(
				convertId(ctx.params.id, IdType.IceshrimpId),
				ctx.request.body as any,
			);
			ctx.body = convertAttachment(data.data);
		} catch (e: any) {
			console.error(e);
			ctx.status = 401;
			ctx.body = e.response.data;
		}
	});

	fileRouter.post("/v1/media", upload.single("file"), async (ctx) => {
		const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
		const accessTokens = ctx.headers.authorization;
		const client = getClient(BASE_URL, accessTokens);
		try {
			const multipartData = await ctx.file;
			if (!multipartData) {
				ctx.body = { error: "No image" };
				ctx.status = 401;
				return;
			}
			const data = await client.uploadMedia(multipartData);
			ctx.body = convertAttachment(data.data as MastodonEntity.Attachment);
		} catch (e: any) {
			console.error(e);
			ctx.status = 401;
			ctx.body = e.response.data;
		}
	});
	fileRouter.post("/v2/media", upload.single("file"), async (ctx) => {
		const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
		const accessTokens = ctx.headers.authorization;
		const client = getClient(BASE_URL, accessTokens);
		try {
			const multipartData = await ctx.file;
			if (!multipartData) {
				ctx.body = { error: "No image" };
				ctx.status = 401;
				return;
			}
			const data = await client.uploadMedia(multipartData, ctx.request.body);
			ctx.body = convertAttachment(data.data as MastodonEntity.Attachment);
		} catch (e: any) {
			console.error(e);
			ctx.status = 401;
			ctx.body = e.response.data;
		}
	});
}
