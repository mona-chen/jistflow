import Router from "@koa/router";
import { convertId, IdType } from "@/misc/convert-id.js";
import { convertAttachmentId } from "@/server/api/mastodon/converters.js";
import multer from "@koa/multer";
import authenticate from "@/server/api/authenticate.js";
import { MediaHelpers } from "@/server/api/mastodon/helpers/media.js";
import { FileConverter } from "@/server/api/mastodon/converters/file.js";

export function setupEndpointsMedia(router: Router, fileRouter: Router, upload: multer.Instance): void {
    router.get<{ Params: { id: string } }>("/v1/media/:id", async (ctx) => {
        try {
            const auth = await authenticate(ctx.headers.authorization, null);
            const user = auth[0] ?? null;

            if (!user) {
                ctx.status = 401;
                return;
            }

            const id = convertId(ctx.params.id, IdType.IceshrimpId);
            const file = await MediaHelpers.getMediaPacked(user, id);

            if (!file) {
                ctx.status = 404;
                ctx.body = {error: "File not found"};
                return;
            }

            const attachment = FileConverter.encode(file);
            ctx.body = convertAttachmentId(attachment);
        } catch (e: any) {
            console.error(e);
            ctx.status = 500;
            ctx.body = e.response.data;
        }
    });
    router.put<{ Params: { id: string } }>("/v1/media/:id", async (ctx) => {
        try {
            const auth = await authenticate(ctx.headers.authorization, null);
            const user = auth[0] ?? null;

            if (!user) {
                ctx.status = 401;
                return;
            }

            const id = convertId(ctx.params.id, IdType.IceshrimpId);
            const file = await MediaHelpers.getMedia(user, id);

            if (!file) {
                ctx.status = 404;
                ctx.body = {error: "File not found"};
                return;
            }

            const result = await MediaHelpers.updateMedia(user, file, ctx.request.body)
                .then(p => FileConverter.encode(p));
            ctx.body = convertAttachmentId(result);
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
                ctx.body = {error: "No image"};
                ctx.status = 400;
                return;
            }
            const result = await MediaHelpers.uploadMedia(user, file, ctx.request.body)
                .then(p => FileConverter.encode(p));
            ctx.body = convertAttachmentId(result);
        } catch (e: any) {
            console.error(e);
            ctx.status = 500;
            ctx.body = {error: e.message};
        }
    });
}
