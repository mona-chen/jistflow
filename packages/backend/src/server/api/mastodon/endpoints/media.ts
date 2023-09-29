import Router from "@koa/router";
import { getClient } from "@/server/api/mastodon/index.js";
import { convertId, IdType } from "@/misc/convert-id.js";
import { convertAttachment } from "@/server/api/mastodon/converters.js";
import multer from "@koa/multer";
import authenticate from "@/server/api/authenticate.js";
import { MediaHelpers } from "@/server/api/mastodon/helpers/media.js";
import { FileConverter } from "@/server/api/mastodon/converters/file.js";

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

	fileRouter.post(["/v2/media", "/v1/media"], upload.single("file"), async (ctx) => {
		try {
			const auth = await authenticate(ctx.headers.authorization, null);
			const user = auth[0] ?? null;

			if (!user) {
				ctx.status = 401;
				return;
			}

			const file = await ctx.file;
			if (!file) {
				ctx.body = { error: "No image" };
				ctx.status = 400;
				return;
			}
			const result = await MediaHelpers.uploadMedia(user, file, ctx.request.body)
				.then(p => FileConverter.encode(p));
			ctx.body = convertAttachment(result);
		} catch (e: any) {
			console.error(e);
			ctx.status = 500;
			ctx.body = { error: e.message };
		}
	});
}
