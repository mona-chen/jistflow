import { ILocalUser } from "@/models/entities/user.js";
import { MastoContext } from "@/server/api/mastodon/index.js";
import { MastoApiError } from "@/server/api/mastodon/middleware/catch-errors.js";
import { OAuthTokens } from "@/models/index.js";
import { OAuthToken } from "@/models/entities/oauth-token.js";
import authenticate from "@/server/api/authenticate.js";
import { AuthHelpers } from "@/server/api/mastodon/helpers/auth.js";

export async function AuthMiddleware(ctx: MastoContext, next: () => Promise<any>) {
    const token = await getTokenFromOAuth(ctx.headers.authorization);

    ctx.appId = token?.appId;
    ctx.user = token?.user ?? null as ILocalUser | null;
    ctx.scopes = token?.scopes ?? [] as string[];

    await next();
}

export async function getTokenFromOAuth(authorization: string | undefined): Promise<OAuthToken | null> {
    if (authorization == null) return null;

    if (authorization.substring(0, 7).toLowerCase() === "bearer ")
        authorization = authorization.substring(7);

    return OAuthTokens.findOne({
        where: { token: authorization, active: true },
        relations: ['user'],
    }).then(token => {
        if (!token) return null;

        return {
            ...token,
            scopes: AuthHelpers.expandScopes(token.scopes),
        }
    });
}

export function auth(required: boolean, scopes: string[] = []) {
    return async function auth(ctx: MastoContext, next: () => Promise<any>) {
        if (required && !ctx.user) throw new MastoApiError(401, "This method requires an authenticated user");

        if (!scopes.every(p => ctx.scopes.includes(p))) {
            if (required) throw new MastoApiError(403, "This action is outside the authorized scopes")

            ctx.user = null;
            ctx.scopes = [];
        }

        await next();
    };
}

export function MiAuth(required: boolean) {
    return async function MiAuth(ctx: MastoContext, next: () => Promise<any>) {
        ctx.miauth = (await authenticate(ctx.headers.authorization, null, true).catch(_ => [null, null]));
        if (required && !ctx.miauth[0]) throw new MastoApiError(401, "Unauthorized");
        await next();
    };
}
