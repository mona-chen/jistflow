import OAuth from "@/server/api/mastodon/entities/oauth/oauth.js";
import { secureRndstr } from "@/misc/secure-rndstr.js";
import { OAuthApps, OAuthTokens } from "@/models/index.js";
import { genId } from "@/misc/gen-id.js";
import { fetchMeta } from "@/misc/fetch-meta.js";
import { MastoContext } from "@/server/api/mastodon/index.js";
import { MastoApiError } from "@/server/api/mastodon/middleware/catch-errors.js";
import { toSingleLast, unique } from "@/prelude/array.js";
import { ILocalUser } from "@/models/entities/user.js";

export class AuthHelpers {
    public static async registerApp(ctx: MastoContext): Promise<OAuth.Application> {
        const body: any = ctx.request.body || ctx.request.query;
        const scopes = (typeof body.scopes === "string" ? body.scopes.split(' ') : body.scopes) ?? ['read'];
        const redirect_uris = body.redirect_uris?.split('\n') as string[] | undefined;
        const client_name = body.client_name;
        const website = body.website;

        if (client_name == null) throw new MastoApiError(400, 'Missing client_name param');
        if (redirect_uris == null || redirect_uris.length < 1) throw new MastoApiError(400, 'Missing redirect_uris param');

        try {
            redirect_uris.every(u => this.validateRedirectUri(u));
        } catch {
            throw new MastoApiError(400, 'Invalid redirect_uris');
        }

        const app = await OAuthApps.insert({
            id: genId(),
            clientId: secureRndstr(32),
            clientSecret: secureRndstr(32),
            createdAt: new Date(),
            name: client_name,
            website: website,
            scopes: scopes,
            redirectUris: redirect_uris,
        }).then((x) => OAuthApps.findOneByOrFail(x.identifiers[0]));

        return {
            name: app.name,
            website: website,
            client_id: app.clientId,
            client_secret: app.clientSecret,
            vapid_key: await fetchMeta().then(meta => meta.swPublicKey ?? undefined),
        };
    }

    public static async getAuthCode(ctx: MastoContext) {
        const user = ctx.miauth[0] as ILocalUser;
        if (!user) throw new MastoApiError(401, "Unauthorized");

        const body = ctx.request.body as any;
        const scopes = body.scopes as string[];
        const clientId = toSingleLast(body.client_id);

        if (clientId == null) throw new MastoApiError(400, "Invalid client_id");

        const app = await OAuthApps.findOneBy({ clientId: clientId });

        this.validateRedirectUri(body.redirect_uri);
        if (!app) throw new MastoApiError(400, "Invalid client_id");
        if (!scopes.every(p => app.scopes.includes(p))) throw new MastoApiError(400, "Cannot request more scopes than application");
        if (!app.redirectUris.includes(body.redirect_uri)) throw new MastoApiError(400, "Redirect URI not in list");

        const token = await OAuthTokens.insert({
            id: genId(),
            active: false,
            code: secureRndstr(32),
            token: secureRndstr(32),
            appId: app.id,
            userId: user.id,
            createdAt: new Date(),
            scopes: scopes,
            redirectUri: body.redirect_uri,
        }).then((x) => OAuthTokens.findOneByOrFail(x.identifiers[0]));

        return { code: token.code };
    }

    public static async getAppInfo(ctx: MastoContext) {
        const body = ctx.request.body as any;
        const clientId = toSingleLast(body.client_id);

        if (clientId == null) throw new MastoApiError(400, "Invalid client_id");

        const app = await OAuthApps.findOneBy({ clientId: clientId });

        if (!app) throw new MastoApiError(400, "Invalid client_id");

        return { name: app.name };
    }

    public static async getAuthToken(ctx: MastoContext) {
        const body: any = ctx.request.body || ctx.request.query;
        const scopes = body.scopes as string[] ?? ['read'];
        const clientId = toSingleLast(body.client_id);
        const code = toSingleLast(body.code);

        const invalidScopeError = new MastoApiError(400, "invalid_scope", "The requested scope is invalid, unknown, or malformed.");
        const invalidClientError = new MastoApiError(401, "invalid_client", "Client authentication failed due to unknown client, no client authentication included, or unsupported authentication method.");

        if (clientId == null) throw invalidClientError;
        if (code == null) throw new MastoApiError(401, "Invalid code");

        const app = await OAuthApps.findOneBy({ clientId: clientId });
        const token = await OAuthTokens.findOneBy({ code: code });

        this.validateRedirectUri(body.redirect_uri);
        if (body.grant_type !== 'authorization_code') throw new MastoApiError(400, "Invalid grant_type");
        if (!app || body.client_secret !== app.clientSecret) throw invalidClientError;
        if (!token || app.id !== token.appId) throw new MastoApiError(401, "Invalid code");
        if (!scopes.every(p => app.scopes.includes(p))) throw invalidScopeError;
        if (!app.redirectUris.includes(body.redirect_uri)) throw new MastoApiError(400, "Redirect URI not in list");

        await OAuthTokens.update(token.id, { active: true });

        return {
            "access_token": token.token,
            "token_type": "Bearer",
            "scope": token.scopes.join(' '),
            "created_at": Math.floor(token.createdAt.getTime() / 1000)
        };
    }

    public static async revokeAuthToken(ctx: MastoContext) {
        const error = new MastoApiError(403, "unauthorized_client", "You are not authorized to revoke this token");
        const body: any = ctx.request.body || ctx.request.query;
        const clientId = toSingleLast(body.client_id);
        const clientSecret = toSingleLast(body.client_secret);
        const token = toSingleLast(body.token);

        if (clientId == null || clientSecret == null || token == null) throw error;

        const app = await OAuthApps.findOneBy({ clientId: clientId, clientSecret: clientSecret });
        const oatoken = await OAuthTokens.findOneBy({ token: token });

        if (!app || !oatoken || app.id !== oatoken.appId) throw error;

        await OAuthTokens.delete(oatoken.id);

        return {};
    }

    public static async verifyAppCredentials(ctx: MastoContext) {
        console.log(ctx.appId);
        if (!ctx.appId) throw new MastoApiError(401, "The access token is invalid");
        const app = await OAuthApps.findOneByOrFail({ id: ctx.appId });
        return {
            name: app.name,
            website: app.website,
            vapid_key: await fetchMeta().then(meta => meta.swPublicKey ?? undefined),
        }
    }

    private static validateRedirectUri(redirectUri: string): void {
        const error = new MastoApiError(400, "Invalid redirect_uri");
        if (redirectUri == null) throw error;
        if (redirectUri === 'urn:ietf:wg:oauth:2.0:oob') return;
        try {
            const url = new URL(redirectUri);
            if (["javascript:", "file:", "data:", "mailto:", "tel:"].includes(url.protocol)) throw error;
        } catch {
            throw error;
        }
    }

    private static readScopes = [
        "read:accounts",
        "read:blocks",
        "read:bookmarks",
        "read:favourites",
        "read:filters",
        "read:follows",
        "read:lists",
        "read:mutes",
        "read:notifications",
        "read:search",
        "read:statuses",
    ];
    private static writeScopes = [
        "write:accounts",
        "write:blocks",
        "write:bookmarks",
        "write:conversations",
        "write:favourites",
        "write:filters",
        "write:follows",
        "write:lists",
        "write:media",
        "write:mutes",
        "write:notifications",
        "write:reports",
        "write:statuses",
    ];
    private static followScopes = [
        "read:follows",
        "read:blocks",
        "read:mutes",
        "write:follows",
        "write:blocks",
        "write:mutes",
    ];

    public static expandScopes(scopes: string[]): string[] {
        const res: string[] = [];

        for (const scope of scopes) {
            if (scope === "read")
                res.push(...this.readScopes);
            else if (scope === "write")
                res.push(...this.writeScopes);
            else if (scope === "follow")
                res.push(...this.followScopes);
            else
                res.push(scope);
        }

        return unique(res);
    }
}
