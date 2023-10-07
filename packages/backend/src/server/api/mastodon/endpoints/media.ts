import Router from "@koa/router";
import { convertId, IdType } from "@/misc/convert-id.js";
import { convertAttachmentId } from "@/server/api/mastodon/converters.js";
import { MediaHelpers } from "@/server/api/mastodon/helpers/media.js";
import { FileConverter } from "@/server/api/mastodon/converters/file.js";
import { auth } from "@/server/api/mastodon/middleware/auth.js";

export function setupEndpointsMedia(router: Router): void {
    router.get<{ Params: { id: string } }>("/v1/media/:id",
        auth(true, ['write:media']),
        async (ctx) => {
            const id = convertId(ctx.params.id, IdType.IceshrimpId);
            const file = await MediaHelpers.getMediaPackedOr404(id, ctx);
            const attachment = FileConverter.encode(file);
            ctx.body = convertAttachmentId(attachment);
        }
    );
    router.put<{ Params: { id: string } }>("/v1/media/:id",
        auth(true, ['write:media']),
        async (ctx) => {
            const id = convertId(ctx.params.id, IdType.IceshrimpId);
            const file = await MediaHelpers.getMediaOr404(id, ctx);
            const result = await MediaHelpers.updateMedia(file, ctx)
                .then(p => FileConverter.encode(p));
            ctx.body = convertAttachmentId(result);
        }
    );
    router.post(["/v2/media", "/v1/media"],
        auth(true, ['write:media']),
        async (ctx) => {
            const result = await MediaHelpers.uploadMedia(ctx)
                .then(p => FileConverter.encode(p));
            ctx.body = convertAttachmentId(result);
        }
    );
}
