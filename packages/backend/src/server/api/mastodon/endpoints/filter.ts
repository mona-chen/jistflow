import Router from "@koa/router";
import { getClient } from "../index.js";
import { convertId, IdType } from "../../index.js";
import { convertFilterId } from "../converters.js";

export function setupEndpointsFilter(router: Router): void {
    router.get("/v1/filters", async (ctx) => {
        const BASE_URL = `${ctx.request.protocol}://${ctx.request.hostname}`;
        const accessTokens = ctx.request.headers.authorization;
        const client = getClient(BASE_URL, accessTokens);
        const body: any = ctx.request.body;
        try {
            const data = await client.getFilters();
            ctx.body = data.data.map((filter) => convertFilterId(filter));
        } catch (e: any) {
            console.error(e);
            ctx.status = 401;
            ctx.body = e.response.data;
        }
    });

    router.get("/v1/filters/:id", async (ctx) => {
        const BASE_URL = `${ctx.request.protocol}://${ctx.request.hostname}`;
        const accessTokens = ctx.request.headers.authorization;
        const client = getClient(BASE_URL, accessTokens);
        const body: any = ctx.request.body;
        try {
            const data = await client.getFilter(
                convertId(ctx.params.id, IdType.IceshrimpId),
            );
            ctx.body = convertFilterId(data.data);
        } catch (e: any) {
            console.error(e);
            ctx.status = 401;
            ctx.body = e.response.data;
        }
    });

    router.post("/v1/filters", async (ctx) => {
        const BASE_URL = `${ctx.request.protocol}://${ctx.request.hostname}`;
        const accessTokens = ctx.request.headers.authorization;
        const client = getClient(BASE_URL, accessTokens);
        const body: any = ctx.request.body;
        try {
            const data = await client.createFilter(body.phrase, body.context, body);
            ctx.body = convertFilterId(data.data);
        } catch (e: any) {
            console.error(e);
            ctx.status = 401;
            ctx.body = e.response.data;
        }
    });

    router.post("/v1/filters/:id", async (ctx) => {
        const BASE_URL = `${ctx.request.protocol}://${ctx.request.hostname}`;
        const accessTokens = ctx.request.headers.authorization;
        const client = getClient(BASE_URL, accessTokens);
        const body: any = ctx.request.body;
        try {
            const data = await client.updateFilter(
                convertId(ctx.params.id, IdType.IceshrimpId),
                body.phrase,
                body.context,
            );
            ctx.body = convertFilterId(data.data);
        } catch (e: any) {
            console.error(e);
            ctx.status = 401;
            ctx.body = e.response.data;
        }
    });

    router.delete("/v1/filters/:id", async (ctx) => {
        const BASE_URL = `${ctx.request.protocol}://${ctx.request.hostname}`;
        const accessTokens = ctx.request.headers.authorization;
        const client = getClient(BASE_URL, accessTokens);
        const body: any = ctx.request.body;
        try {
            const data = await client.deleteFilter(
                convertId(ctx.params.id, IdType.IceshrimpId),
            );
            ctx.body = data.data;
        } catch (e: any) {
            console.error(e);
            ctx.status = 401;
            ctx.body = e.response.data;
        }
    });
}
