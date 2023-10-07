import Router from "@koa/router";
import { AuthHelpers } from "@/server/api/mastodon/helpers/auth.js";
import { AuthConverter } from "@/server/api/mastodon/converters/auth.js";
import { v4 as uuid } from "uuid";
import { MastoApiError } from "@/server/api/mastodon/middleware/catch-errors.js";
import { toSingleLast } from "@/prelude/array.js";

export function setupEndpointsAuth(router: Router): void {
    router.post("/v1/apps", async (ctx) => {
        const body: any = ctx.request.body || ctx.request.query;
        let scope = body.scopes;
        if (typeof scope === "string") scope = scope.split(" ");
        const scopeArr = AuthConverter.decode(scope);
        const red = body.redirect_uris;
        const appData = await AuthHelpers.registerApp(body['client_name'], scopeArr, red, body['website']);
        ctx.body = {
            id: appData.id,
            name: appData.name,
            website: body.website,
            redirect_uri: red,
            client_id: Buffer.from(appData.url ?? "").toString("base64"),
            client_secret: appData.clientSecret,
        };
    });
}

export function setupEndpointsAuthRoot(router: Router): void {
    router.get("/oauth/authorize", async (ctx) => {
        const { client_id, state, redirect_uri } = ctx.request.query;
        let param = "mastodon=true";
        if (state) param += `&state=${state}`;
        const final_redirect_uri = toSingleLast(redirect_uri);
        if (final_redirect_uri) param += `&redirect_uri=${encodeURIComponent(final_redirect_uri)}`;
        const client = client_id ? client_id : "";
        ctx.redirect(`${Buffer.from(client.toString(), "base64").toString()}?${param}`);
    });

    router.post("/oauth/token", async (ctx) => {
        const body: any = ctx.request.body || ctx.request.query;
        if (body.grant_type === "client_credentials") {
            ctx.body = {
                access_token: uuid(),
                token_type: "Bearer",
                scope: "read",
                created_at: Math.floor(new Date().getTime() / 1000),
            };
            return;
        }
        let token = null;
        if (body.code) {
            token = body.code;
        }
        const accessToken = await AuthHelpers.getAuthToken(body.client_secret, token ? token : "").catch(_ => {
            throw new MastoApiError(401);
        });
        ctx.body = {
            access_token: accessToken,
            token_type: "Bearer",
            scope: body.scope || "read write follow push",
            created_at: Math.floor(new Date().getTime() / 1000),
        };
    });
}
