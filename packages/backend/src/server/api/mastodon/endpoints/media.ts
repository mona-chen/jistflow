import Router from "@koa/router";
import { MediaHelpers } from "@/server/api/mastodon/helpers/media.js";
import { FileConverter } from "@/server/api/mastodon/converters/file.js";
import { auth } from "@/server/api/mastodon/middleware/auth.js";

export function setupEndpointsMedia(router: Router): void {
    router.get<{ Params: { id: string } }>("/v1/media/:id",
        auth(true, ['write:media']),
        async (ctx) => {
            const file = await MediaHelpers.getMediaPackedOr404(ctx.params.id, ctx);
            ctx.body = FileConverter.encode(file);
        }
    );
    router.put<{ Params: { id: string } }>("/v1/media/:id",
        auth(true, ['write:media']),
        async (ctx) => {
            const file = await MediaHelpers.getMediaOr404(ctx.params.id, ctx);
            ctx.body = await MediaHelpers.updateMedia(file, ctx)
                .then(p => FileConverter.encode(p));
        }
    );
    router.post(["/v2/media", "/v1/media"],
        auth(true, ['write:media']),
        async (ctx) => {
            ctx.body = await MediaHelpers.uploadMedia(ctx)
                .then(p => FileConverter.encode(p));
        }
    );
}
