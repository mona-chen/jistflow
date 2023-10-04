import Router from "@koa/router";

export function setupEndpointsFilter(router: Router): void {
    router.get(["/v1/filters", "/v2/filters"], async (ctx) => {
        ctx.body = [];
    });
    router.post(["/v1/filters", "/v2/filters"], async (ctx) => {
        ctx.status =  400;
        ctx.body = { error: "Please change word mute settings in the web frontend settings." };
    });
}
