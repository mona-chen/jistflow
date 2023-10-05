import Router from "@koa/router";
import { ParsedUrlQuery } from "querystring";
import { convertConversationIds, convertStatusIds, } from "../converters.js";
import { convertId, IdType } from "../../index.js";
import authenticate from "@/server/api/authenticate.js";
import { TimelineHelpers } from "@/server/api/mastodon/helpers/timeline.js";
import { NoteConverter } from "@/server/api/mastodon/converters/note.js";
import { UserHelpers } from "@/server/api/mastodon/helpers/user.js";
import { UserLists } from "@/models/index.js";
import { PaginationHelpers } from "@/server/api/mastodon/helpers/pagination.js";

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
    let keys = ['only_media', 'exclude_replies', 'exclude_reblogs', 'pinned', 'local', 'remote'].concat(additional);
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

            ctx.body = tl.map(s => convertStatusIds(s));
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
            try {
                const auth = await authenticate(ctx.headers.authorization, null);
                const user = auth[0] ?? undefined;

                if (!user) {
                    ctx.status = 401;
                    return;
                }

                const tag = (ctx.params.hashtag ?? '').trim();
                if (tag.length < 1) {
                    ctx.status = 400;
                    ctx.body = { error: "tag cannot be empty" };
                    return;
                }

                const args = normalizeUrlQuery(convertPaginationArgsIds(argsToBools(limitToInt(ctx.query))), ['any[]', 'all[]', 'none[]']);
                const cache = UserHelpers.getFreshAccountCache();
                const tl = await TimelineHelpers.getTagTimeline(user, tag, args.max_id, args.since_id, args.min_id, args.limit, args['any[]'] ?? [], args['all[]'] ?? [], args['none[]'] ?? [], args.only_media, args.local, args.remote)
                    .then(n => NoteConverter.encodeMany(n, user, cache));

                ctx.body = tl.map(s => convertStatusIds(s));
            } catch (e: any) {
                ctx.status = 400;
                ctx.body = { error: e.message };
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

            ctx.body = tl.map(s => convertStatusIds(s));
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
            try {
                const auth = await authenticate(ctx.headers.authorization, null);
                const user = auth[0] ?? undefined;

                if (!user) {
                    ctx.status = 401;
                    return;
                }

                const listId = convertId(ctx.params.listId, IdType.IceshrimpId);
                const list = await UserLists.findOneBy({userId: user.id, id: listId});

                if (!list) {
                    ctx.status = 404;
                    return;
                }

                const args = normalizeUrlQuery(convertPaginationArgsIds(limitToInt(ctx.query)));
                const cache = UserHelpers.getFreshAccountCache();
                const tl = await TimelineHelpers.getListTimeline(user, list, args.max_id, args.since_id, args.min_id, args.limit)
                    .then(n => NoteConverter.encodeMany(n, user, cache));

                ctx.body = tl.map(s => convertStatusIds(s));

            } catch (e: any) {
                console.error(e);
                console.error(e.response.data);
                ctx.status = 401;
                ctx.body = e.response.data;
            }
        },
    );
    router.get("/v1/conversations", async (ctx, reply) => {
        try {
            const auth = await authenticate(ctx.headers.authorization, null);
            const user = auth[0] ?? undefined;

            if (!user) {
                ctx.status = 401;
                return;
            }

            const args = normalizeUrlQuery(convertPaginationArgsIds(limitToInt(ctx.query)));
            const res = await TimelineHelpers.getConversations(user, args.max_id, args.since_id, args.min_id, args.limit);

            ctx.body = res.data.map(c => convertConversationIds(c));
            PaginationHelpers.appendLinkPaginationHeader(args, ctx, res, 20);
        } catch (e: any) {
            console.error(e);
            console.error(e.response.data);
            ctx.status = 401;
            ctx.body = e.response.data;
        }
    });
}
