import Router from "@koa/router";
import { getClient } from "@/server/api/mastodon/index.js";
import { convertId, IdType } from "@/misc/convert-id.js";
import { convertAccountId, convertAnnouncementId, convertFilterId } from "@/server/api/mastodon/converters.js";
import { Users } from "@/models/index.js";
import { getInstance } from "@/server/api/mastodon/endpoints/meta.js";
import { IsNull } from "typeorm";
import { MiscHelpers } from "@/server/api/mastodon/helpers/misc.js";

export function setupEndpointsMisc(router: Router): void {
    router.get("/v1/custom_emojis", async (ctx) => {
        const BASE_URL = `${ctx.request.protocol}://${ctx.request.hostname}`;
        const accessTokens = ctx.request.headers.authorization;
        const client = getClient(BASE_URL, accessTokens);
        try {
            const data = await client.getInstanceCustomEmojis();
            ctx.body = data.data;
        } catch (e: any) {
            console.error(e);
            ctx.status = 401;
            ctx.body = e.response.data;
        }
    });

    router.get("/v1/instance", async (ctx) => {
        try {
            ctx.body = await MiscHelpers.getInstance();
        } catch (e: any) {
            console.error(e);
            ctx.status = 500;
            ctx.body = { error: e.message };
        }
    });

    router.get("/v1/announcements", async (ctx) => {
        const BASE_URL = `${ctx.request.protocol}://${ctx.request.hostname}`;
        const accessTokens = ctx.request.headers.authorization;
        const client = getClient(BASE_URL, accessTokens);
        try {
            const data = await client.getInstanceAnnouncements();
            ctx.body = data.data.map((announcement) =>
                convertAnnouncementId(announcement),
            );
        } catch (e: any) {
            console.error(e);
            ctx.status = 401;
            ctx.body = e.response.data;
        }
    });

    router.post<{ Params: { id: string } }>(
        "/v1/announcements/:id/dismiss",
        async (ctx) => {
            const BASE_URL = `${ctx.request.protocol}://${ctx.request.hostname}`;
            const accessTokens = ctx.request.headers.authorization;
            const client = getClient(BASE_URL, accessTokens);
            try {
                const data = await client.dismissInstanceAnnouncement(
                    convertId(ctx.params.id, IdType.IceshrimpId),
                );
                ctx.body = data.data;
            } catch (e: any) {
                console.error(e);
                ctx.status = 401;
                ctx.body = e.response.data;
            }
        },
    );

    router.get("/v1/filters", async (ctx) => {
        const BASE_URL = `${ctx.request.protocol}://${ctx.request.hostname}`;
        const accessTokens = ctx.request.headers.authorization;
        const client = getClient(BASE_URL, accessTokens); // we are using this here, because in private mode some info isnt
        // displayed without being logged in
        try {
            const data = await client.getFilters();
            ctx.body = data.data.map((filter) => convertFilterId(filter));
        } catch (e: any) {
            console.error(e);
            ctx.status = 401;
            ctx.body = e.response.data;
        }
    });

    router.get("/v1/trends", async (ctx) => {
        const BASE_URL = `${ctx.request.protocol}://${ctx.request.hostname}`;
        const accessTokens = ctx.request.headers.authorization;
        const client = getClient(BASE_URL, accessTokens); // we are using this here, because in private mode some info isnt
        // displayed without being logged in
        try {
            const data = await client.getInstanceTrends();
            ctx.body = data.data;
        } catch (e: any) {
            console.error(e);
            ctx.status = 401;
            ctx.body = e.response.data;
        }
    });

    router.get("/v1/preferences", async (ctx) => {
        const BASE_URL = `${ctx.request.protocol}://${ctx.request.hostname}`;
        const accessTokens = ctx.request.headers.authorization;
        const client = getClient(BASE_URL, accessTokens); // we are using this here, because in private mode some info isnt
        // displayed without being logged in
        try {
            const data = await client.getPreferences();
            ctx.body = data.data;
        } catch (e: any) {
            console.error(e);
            ctx.status = 401;
            ctx.body = e.response.data;
        }
    });
}
