import Router from "@koa/router";

export function setupEndpointsStreaming(router: Router): void {
    router.get("/v1/streaming/health", async (ctx) => {
        ctx.body = "OK";
    });
}