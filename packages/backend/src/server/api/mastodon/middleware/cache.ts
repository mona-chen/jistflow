import { MastoContext } from "@/server/api/mastodon/index.js";
import { UserHelpers } from "@/server/api/mastodon/helpers/user.js";

export async function CacheMiddleware(ctx: MastoContext, next: () => Promise<any>) {
    ctx.cache = UserHelpers.getFreshAccountCache();
    await next();
}
