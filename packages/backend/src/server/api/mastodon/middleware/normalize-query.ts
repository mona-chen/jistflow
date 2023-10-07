import { MastoContext } from "@/server/api/mastodon/index.js";

export async function NormalizeQueryMiddleware(ctx: MastoContext, next: () => Promise<any>) {
    if (ctx.request.query) {
        if (!ctx.request.body || Object.keys(ctx.request.body).length === 0) {
            ctx.request.body = ctx.request.query;
        } else {
            ctx.request.body = { ...ctx.request.body, ...ctx.request.query };
        }
    }
    await next();
}
