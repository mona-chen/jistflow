import Router from "@koa/router";
import { convertAccount, convertList, } from "../converters.js";
import { convertId, IdType } from "../../index.js";
import authenticate from "@/server/api/authenticate.js";
import { convertPaginationArgsIds, limitToInt, normalizeUrlQuery } from "@/server/api/mastodon/endpoints/timeline.js";
import { ListHelpers } from "@/server/api/mastodon/helpers/list.js";
import { UserConverter } from "@/server/api/mastodon/converters/user.js";
import { PaginationHelpers } from "@/server/api/mastodon/helpers/pagination.js";
import { UserLists } from "@/models/index.js";
import { NoteHelpers } from "@/server/api/mastodon/helpers/note.js";
import { getUser } from "@/server/api/common/getters.js";
import { toArray } from "@/prelude/array.js";

export function setupEndpointsList(router: Router): void {
    router.get("/v1/lists", async (ctx, reply) => {
        try {
            const auth = await authenticate(ctx.headers.authorization, null);
            const user = auth[0] ?? undefined;

            if (!user) {
                ctx.status = 401;
                return;
            }

            ctx.body = await ListHelpers.getLists(user)
                .then(p => p.map(list => convertList(list)));
        } catch (e: any) {
            console.error(e);
            console.error(e.response.data);
            ctx.status = 401;
            ctx.body = e.response.data;
        }
    });
    router.get<{ Params: { id: string } }>(
        "/v1/lists/:id",
        async (ctx, reply) => {
            try {
                const auth = await authenticate(ctx.headers.authorization, null);
                const user = auth[0] ?? undefined;

                if (!user) {
                    ctx.status = 401;
                    return;
                }

                const id = convertId(ctx.params.id, IdType.IceshrimpId);

                ctx.body = await ListHelpers.getList(user, id)
                    .then(p => convertList(p));
            } catch (e: any) {
                ctx.status = 404;
            }
        },
    );
    router.post("/v1/lists", async (ctx, reply) => {
        try {
            const auth = await authenticate(ctx.headers.authorization, null);
            const user = auth[0] ?? undefined;

            if (!user) {
                ctx.status = 401;
                return;
            }

            const body = ctx.request.body as any;
            const title = (body.title ?? '').trim();
            if (title.length < 1) {
                ctx.body = { error: "Title must not be empty" };
                ctx.status = 400;
                return
            }

            ctx.body = await ListHelpers.createList(user, title)
                .then(p => convertList(p));
        } catch (e: any) {
            ctx.status = 400;
            ctx.body = { error: e.message };
        }
    });
    router.put<{ Params: { id: string } }>(
        "/v1/lists/:id",
        async (ctx, reply) => {
            try {
                const auth = await authenticate(ctx.headers.authorization, null);
                const user = auth[0] ?? undefined;

                if (!user) {
                    ctx.status = 401;
                    return;
                }

                const id = convertId(ctx.params.id, IdType.IceshrimpId);
                const list = await UserLists.findOneBy({userId: user.id, id: id});

                if (!list) {
                    ctx.status = 404;
                    return;
                }

                const body = ctx.request.body as any;
                const title = (body.title ?? '').trim();
                if (title.length < 1) {
                    ctx.body = { error: "Title must not be empty" };
                    ctx.status = 400;
                    return
                }

                ctx.body = await ListHelpers.updateList(user, list, title)
                    .then(p => convertList(p));
            } catch (e: any) {
                console.error(e);
                console.error(e.response.data);
                ctx.status = 401;
                ctx.body = e.response.data;
            }
        },
    );
    router.delete<{ Params: { id: string } }>(
        "/v1/lists/:id",
        async (ctx, reply) => {
            try {
                const auth = await authenticate(ctx.headers.authorization, null);
                const user = auth[0] ?? undefined;

                if (!user) {
                    ctx.status = 401;
                    return;
                }

                const id = convertId(ctx.params.id, IdType.IceshrimpId);
                const list = await UserLists.findOneBy({userId: user.id, id: id});

                if (!list) {
                    ctx.status = 404;
                    return;
                }

                await ListHelpers.deleteList(user, list);
                ctx.body = {};
            } catch (e: any) {
                ctx.status = 500;
                ctx.body = { error: e.message };
            }
        },
    );
    router.get<{ Params: { id: string } }>(
        "/v1/lists/:id/accounts",
        async (ctx, reply) => {
            try {
                const auth = await authenticate(ctx.headers.authorization, null);
                const user = auth[0] ?? undefined;

                if (!user) {
                    ctx.status = 401;
                    return;
                }

                const id = convertId(ctx.params.id, IdType.IceshrimpId);
                const args = normalizeUrlQuery(convertPaginationArgsIds(limitToInt(ctx.query)));
                const res = await ListHelpers.getListUsers(user, id, args.max_id, args.since_id, args.min_id, args.limit);
                const accounts = await UserConverter.encodeMany(res.data);
                ctx.body = accounts.map(account => convertAccount(account));
                PaginationHelpers.appendLinkPaginationHeader(args, ctx, res, 40);
            } catch (e: any) {
                ctx.status = 404;
            }
        },
    );
    router.post<{ Params: { id: string } }>(
        "/v1/lists/:id/accounts",
        async (ctx, reply) => {
            try {
                const auth = await authenticate(ctx.headers.authorization, null);
                const user = auth[0] ?? undefined;

                if (!user) {
                    ctx.status = 401;
                    return;
                }

                const id = convertId(ctx.params.id, IdType.IceshrimpId);
                const list = await UserLists.findOneBy({userId: user.id, id: id});

                if (!list) {
                    ctx.status = 404;
                    return;
                }

                const body = ctx.request.body as any;
                if (!body['account_ids']) {
                    ctx.status = 400;
                    ctx.body = { error: "Missing account_ids[] field" };
                    return;
                }

                const ids = toArray(body['account_ids']).map(p => convertId(p, IdType.IceshrimpId));
                const targets = await Promise.all(ids.map(p => getUser(p)));
                await ListHelpers.addToList(user, list, targets);
                ctx.body = {}
            } catch (e: any) {
                ctx.status = 400;
                ctx.body = { error: e.message };
            }
        },
    );
    router.delete<{ Params: { id: string } }>(
        "/v1/lists/:id/accounts",
        async (ctx, reply) => {
            try {
                const auth = await authenticate(ctx.headers.authorization, null);
                const user = auth[0] ?? undefined;

                if (!user) {
                    ctx.status = 401;
                    return;
                }

                const id = convertId(ctx.params.id, IdType.IceshrimpId);
                const list = await UserLists.findOneBy({userId: user.id, id: id});

                if (!list) {
                    ctx.status = 404;
                    return;
                }

                const body = ctx.request.body as any;
                if (!body['account_ids']) {
                    ctx.status = 400;
                    ctx.body = { error: "Missing account_ids[] field" };
                    return;
                }

                const ids = toArray(body['account_ids']).map(p => convertId(p, IdType.IceshrimpId));
                const targets = await Promise.all(ids.map(p => getUser(p)));
                await ListHelpers.removeFromList(user, list, targets);
                ctx.body = {}
            } catch (e: any) {
                ctx.status = 400;
                ctx.body = { error: e.message };
            }
        },
    );
}
