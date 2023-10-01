import Router from "@koa/router";
import { getClient } from "../index.js";
import { ParsedUrlQuery } from "querystring";
import { convertConversation, convertStatus, } from "../converters.js";
import { convertId, IdType } from "../../index.js";
import authenticate from "@/server/api/authenticate.js";
import { TimelineHelpers } from "@/server/api/mastodon/helpers/timeline.js";
import { NoteConverter } from "@/server/api/mastodon/converters/note.js";
import { UserHelpers } from "@/server/api/mastodon/helpers/user.js";

export function limitToInt(q: ParsedUrlQuery, additional: string[] = []) {
    let object: any = q;
    if (q.limit)
        if (typeof q.limit === "string") object.limit = parseInt(q.limit, 10);
    if (q.offset)
        if (typeof q.offset === "string") object.offset = parseInt(q.offset, 10);
    for (const key of additional)
        if (typeof q[key] === "string") object[key] = parseInt(<string>q[key], 10);
    return object;
}

export function argsToBools(q: ParsedUrlQuery, additional: string[] = []) {
    // Values taken from https://docs.joinmastodon.org/client/intro/#boolean
    const toBoolean = (value: string) =>
        !["0", "f", "F", "false", "FALSE", "off", "OFF"].includes(value);

    // Keys taken from:
    // - https://docs.joinmastodon.org/methods/accounts/#statuses
    // - https://docs.joinmastodon.org/methods/timelines/#public
    // - https://docs.joinmastodon.org/methods/timelines/#tag
    let keys = ['only_media', 'exclude_replies', 'exclude_reblogs', 'pinned', 'local', 'remote']
    let object: any = q;

    for (const key of keys)
        if (q[key] && typeof q[key] === "string")
            object[key] = toBoolean(<string>q[key]);

    return object;
}

export function convertPaginationArgsIds(q: ParsedUrlQuery) {
    if (typeof q.min_id === "string")
        q.min_id = convertId(q.min_id, IdType.IceshrimpId);
    if (typeof q.max_id === "string")
        q.max_id = convertId(q.max_id, IdType.IceshrimpId);
    if (typeof q.since_id === "string")
        q.since_id = convertId(q.since_id, IdType.IceshrimpId);
    return q;
}

export function normalizeUrlQuery(q: ParsedUrlQuery, arrayKeys: string[] = []): any {
    const dict: any = {};

    for (const k in q) {
        if (arrayKeys.includes(k))
            dict[k] = Array.isArray(q[k]) ? q[k] : [q[k]];
        else
            dict[k] = Array.isArray(q[k]) ? q[k]?.at(-1) : q[k];
    }

    return dict;
}

export function setupEndpointsTimeline(router: Router): void {
    router.get("/v1/timelines/public", async (ctx, reply) => {
        try {
            const auth = await authenticate(ctx.headers.authorization, null);
            const user = auth[0] ?? undefined;

            if (!user) {
                ctx.status = 401;
                return;
            }

            const args = normalizeUrlQuery(convertPaginationArgsIds(argsToBools(limitToInt(ctx.query))));
            const cache = UserHelpers.getFreshAccountCache();
            const tl = await TimelineHelpers.getPublicTimeline(user, args.max_id, args.since_id, args.min_id, args.limit, args.only_media, args.local, args.remote)
                .then(n => NoteConverter.encodeMany(n, user, cache));

            ctx.body = tl.map(s => convertStatus(s));
        } catch (e: any) {
            console.error(e);
            console.error(e.response.data);
            ctx.status = 401;
            ctx.body = e.response.data;
        }
    });
    router.get<{ Params: { hashtag: string } }>(
        "/v1/timelines/tag/:hashtag",
        async (ctx, reply) => {
            const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
            const accessTokens = ctx.headers.authorization;
            const client = getClient(BASE_URL, accessTokens);
            try {
                const data = await client.getTagTimeline(
                    ctx.params.hashtag,
                    convertPaginationArgsIds(argsToBools(limitToInt(ctx.query))),
                );
                ctx.body = data.data.map((status) => convertStatus(status));
            } catch (e: any) {
                console.error(e);
                console.error(e.response.data);
                ctx.status = 401;
                ctx.body = e.response.data;
            }
        },
    );
    router.get("/v1/timelines/home", async (ctx, reply) => {
        try {
            const auth = await authenticate(ctx.headers.authorization, null);
            const user = auth[0] ?? undefined;

            if (!user) {
                ctx.status = 401;
                return;
            }

            const args = normalizeUrlQuery(convertPaginationArgsIds(limitToInt(ctx.query)));
            const cache = UserHelpers.getFreshAccountCache();
            const tl = await TimelineHelpers.getHomeTimeline(user, args.max_id, args.since_id, args.min_id, args.limit)
                .then(n => NoteConverter.encodeMany(n, user, cache));

            ctx.body = tl.map(s => convertStatus(s));
        } catch (e: any) {
            console.error(e);
            console.error(e.response.data);
            ctx.status = 401;
            ctx.body = e.response.data;
        }
    });
    router.get<{ Params: { listId: string } }>(
        "/v1/timelines/list/:listId",
        async (ctx, reply) => {
            const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
            const accessTokens = ctx.headers.authorization;
            const client = getClient(BASE_URL, accessTokens);
            try {
                const data = await client.getListTimeline(
                    convertId(ctx.params.listId, IdType.IceshrimpId),
                    convertPaginationArgsIds(limitToInt(ctx.query)),
                );
                ctx.body = data.data.map((status) => convertStatus(status));
            } catch (e: any) {
                console.error(e);
                console.error(e.response.data);
                ctx.status = 401;
                ctx.body = e.response.data;
            }
        },
    );
    router.get("/v1/conversations", async (ctx, reply) => {
        const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
        const accessTokens = ctx.headers.authorization;
        const client = getClient(BASE_URL, accessTokens);
        try {
            const data = await client.getConversationTimeline(
                convertPaginationArgsIds(limitToInt(ctx.query)),
            );
            ctx.body = data.data.map((conversation) =>
                convertConversation(conversation),
            );
        } catch (e: any) {
            console.error(e);
            console.error(e.response.data);
            ctx.status = 401;
            ctx.body = e.response.data;
        }
    });
}
