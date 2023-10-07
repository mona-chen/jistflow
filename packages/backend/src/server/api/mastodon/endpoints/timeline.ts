import Router from "@koa/router";
import { ParsedUrlQuery } from "querystring";
import { convertConversationIds, convertStatusIds, } from "../converters.js";
import { convertId, IdType } from "../../index.js";
import { TimelineHelpers } from "@/server/api/mastodon/helpers/timeline.js";
import { NoteConverter } from "@/server/api/mastodon/converters/note.js";
import { UserLists } from "@/models/index.js";
import { auth } from "@/server/api/mastodon/middleware/auth.js";
import { MastoApiError } from "@/server/api/mastodon/middleware/catch-errors.js";

//TODO: Move helper functions to a helper class
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
    router.get("/v1/timelines/public",
        auth(true, ['read:statuses']),
        async (ctx, reply) => {
            const args = normalizeUrlQuery(convertPaginationArgsIds(argsToBools(limitToInt(ctx.query))));
            const res = await TimelineHelpers.getPublicTimeline(ctx.user, args.max_id, args.since_id, args.min_id, args.limit, args.only_media, args.local, args.remote);
            const tl = await NoteConverter.encodeMany(res.data, ctx.user, ctx);

            ctx.body = tl.map(s => convertStatusIds(s));
            ctx.pagination = res.pagination;
        });
    router.get<{ Params: { hashtag: string } }>(
        "/v1/timelines/tag/:hashtag",
        auth(false, ['read:statuses']),
        async (ctx, reply) => {
            const tag = (ctx.params.hashtag ?? '').trim();
            const args = normalizeUrlQuery(convertPaginationArgsIds(argsToBools(limitToInt(ctx.query))), ['any[]', 'all[]', 'none[]']);
            const res = await TimelineHelpers.getTagTimeline(ctx.user, tag, args.max_id, args.since_id, args.min_id, args.limit, args['any[]'] ?? [], args['all[]'] ?? [], args['none[]'] ?? [], args.only_media, args.local, args.remote);
            const tl = await NoteConverter.encodeMany(res.data, ctx.user, ctx);

            ctx.body = tl.map(s => convertStatusIds(s));
            ctx.pagination = res.pagination;
        },
    );
    router.get("/v1/timelines/home",
        auth(true, ['read:statuses']),
        async (ctx, reply) => {
            const args = normalizeUrlQuery(convertPaginationArgsIds(limitToInt(ctx.query)));
            const res = await TimelineHelpers.getHomeTimeline(ctx.user, args.max_id, args.since_id, args.min_id, args.limit);
            const tl = await NoteConverter.encodeMany(res.data, ctx.user, ctx);

            ctx.body = tl.map(s => convertStatusIds(s));
            ctx.pagination = res.pagination;
        });
    router.get<{ Params: { listId: string } }>(
        "/v1/timelines/list/:listId",
        auth(true, ['read:lists']),
        async (ctx, reply) => {
            const listId = convertId(ctx.params.listId, IdType.IceshrimpId);
            const list = await UserLists.findOneBy({ userId: ctx.user.id, id: listId });
            if (!list) throw new MastoApiError(404);

            const args = normalizeUrlQuery(convertPaginationArgsIds(limitToInt(ctx.query)));
            const res = await TimelineHelpers.getListTimeline(ctx.user, list, args.max_id, args.since_id, args.min_id, args.limit);
            const tl = await NoteConverter.encodeMany(res.data, ctx.user, ctx);

            ctx.body = tl.map(s => convertStatusIds(s));
            ctx.pagination = res.pagination;
        },
    );
    router.get("/v1/conversations",
        auth(true, ['read:statuses']),
        async (ctx, reply) => {
            const args = normalizeUrlQuery(convertPaginationArgsIds(limitToInt(ctx.query)));
            const res = await TimelineHelpers.getConversations(ctx.user, args.max_id, args.since_id, args.min_id, args.limit, ctx);

            ctx.body = res.data.map(c => convertConversationIds(c));
            ctx.pagination = res.pagination;
        }
    );
}
