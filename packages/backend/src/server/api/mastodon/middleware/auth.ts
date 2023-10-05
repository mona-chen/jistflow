import authenticate from "@/server/api/authenticate.js";
import { ILocalUser } from "@/models/entities/user.js";
import { MastoContext } from "@/server/api/mastodon/index.js";
import { AuthConverter } from "@/server/api/mastodon/converters/auth.js";

export async function AuthMiddleware(ctx: MastoContext, next: () => Promise<any>) {
    const auth = await authenticate(ctx.headers.authorization, null, true);
    ctx.user = auth[0] ?? null as ILocalUser | null;
    ctx.scopes = auth[1]?.permission ?? [] as string[];

    await next();
}

export function auth(required: boolean, scopes: string[] = []) {
    return async function auth(ctx: MastoContext, next: () => Promise<any>) {
        if (required && !ctx.user) {
            ctx.status = 401;
            ctx.body = { error: "This method requires an authenticated user" };
            return;
        }

        if (!AuthConverter.decode(scopes).every(p =>  ctx.scopes.includes(p))) {
            if (required) {
                ctx.status = 403;
                ctx.body = {error: "This action is outside the authorized scopes"};
            }
            else {
                ctx.user = null;
                ctx.scopes = [];
            }
        }

        ctx.scopes = AuthConverter.encode(ctx.scopes);

        await next();
    };
}