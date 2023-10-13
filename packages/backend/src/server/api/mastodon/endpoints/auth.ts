import Router from "@koa/router";
import { AuthHelpers } from "@/server/api/mastodon/helpers/auth.js";
import { MiAuth } from "@/server/api/mastodon/middleware/auth.js";

export function setupEndpointsAuth(router: Router): void {
    router.post("/v1/apps", async (ctx) => {
        ctx.body = await AuthHelpers.registerApp(ctx);
    });

    router.get("/v1/apps/verify_credentials", async (ctx) => {
        ctx.body = await AuthHelpers.verifyAppCredentials(ctx);
    });

    router.post("/v1/iceshrimp/apps/info",
        MiAuth(true),
        async (ctx) => {
            ctx.body = await AuthHelpers.getAppInfo(ctx);
        });

    router.post("/v1/iceshrimp/auth/code",
        MiAuth(true),
        async (ctx) => {
            ctx.body = await AuthHelpers.getAuthCode(ctx);
        });
}

export function setupEndpointsAuthRoot(router: Router): void {
    router.post("/oauth/token", async (ctx) => {
        ctx.body = await AuthHelpers.getAuthToken(ctx);
    });

    router.post("/oauth/revoke", async (ctx) => {
        ctx.body = await AuthHelpers.revokeAuthToken(ctx);
    });
}
