import { MastoContext } from "@/server/api/mastodon/index.js";

export function filterContext(context: string) {
    return async function filterContext(ctx: MastoContext, next: () => Promise<any>) {
        ctx.filterContext = context;
        await next();
    };
}
