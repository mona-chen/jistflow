import Router from "@koa/router";
import { convertAccountId, convertListId, } from "../converters.js";
import { convertId, IdType } from "../../index.js";
import { convertPaginationArgsIds, limitToInt, normalizeUrlQuery } from "@/server/api/mastodon/endpoints/timeline.js";
import { ListHelpers } from "@/server/api/mastodon/helpers/list.js";
import { UserConverter } from "@/server/api/mastodon/converters/user.js";
import { PaginationHelpers } from "@/server/api/mastodon/helpers/pagination.js";
import { UserLists } from "@/models/index.js";
import { getUser } from "@/server/api/common/getters.js";
import { toArray } from "@/prelude/array.js";
import { auth } from "@/server/api/mastodon/middleware/auth.js";
import { MastoApiError } from "@/server/api/mastodon/middleware/catch-errors.js";

export function setupEndpointsList(router: Router): void {
    router.get("/v1/lists",
        auth(true, ['read:lists']),
        async (ctx, reply) => {
            ctx.body = await ListHelpers.getLists(ctx.user)
                .then(p => p.map(list => convertListId(list)));
        }
    );
    router.get<{ Params: { id: string } }>(
        "/v1/lists/:id",
        auth(true, ['read:lists']),
        async (ctx, reply) => {
            const id = convertId(ctx.params.id, IdType.IceshrimpId);

            ctx.body = await ListHelpers.getListOr404(ctx.user, id)
                .then(p => convertListId(p));
        },
    );
    router.post("/v1/lists",
        auth(true, ['write:lists']),
        async (ctx, reply) => {
            const body = ctx.request.body as any;
            const title = (body.title ?? '').trim();

            ctx.body = await ListHelpers.createList(ctx.user, title)
                .then(p => convertListId(p));
        }
    );
    router.put<{ Params: { id: string } }>(
        "/v1/lists/:id",
        auth(true, ['write:lists']),
        async (ctx, reply) => {
            const id = convertId(ctx.params.id, IdType.IceshrimpId);
            const list = await UserLists.findOneBy({ userId: ctx.user.id, id: id });
            if (!list) throw new MastoApiError(404);

            const body = ctx.request.body as any;
            const title = (body.title ?? '').trim();
            ctx.body = await ListHelpers.updateList(ctx.user, list, title)
                .then(p => convertListId(p));
        },
    );
    router.delete<{ Params: { id: string } }>(
        "/v1/lists/:id",
        auth(true, ['write:lists']),
        async (ctx, reply) => {
            const id = convertId(ctx.params.id, IdType.IceshrimpId);
            const list = await UserLists.findOneBy({ userId: ctx.user.id, id: id });
            if (!list) throw new MastoApiError(404);

            await ListHelpers.deleteList(ctx.user, list);
            ctx.body = {};
        },
    );
    router.get<{ Params: { id: string } }>(
        "/v1/lists/:id/accounts",
        auth(true, ['read:lists']),
        async (ctx, reply) => {
            const id = convertId(ctx.params.id, IdType.IceshrimpId);
            const args = normalizeUrlQuery(convertPaginationArgsIds(limitToInt(ctx.query)));
            const res = await ListHelpers.getListUsers(ctx.user, id, args.max_id, args.since_id, args.min_id, args.limit);
            const accounts = await UserConverter.encodeMany(res.data);

            ctx.body = accounts.map(account => convertAccountId(account));
            PaginationHelpers.appendLinkPaginationHeader(args, ctx, res, 40);
        },
    );
    router.post<{ Params: { id: string } }>(
        "/v1/lists/:id/accounts",
        auth(true, ['write:lists']),
        async (ctx, reply) => {
            const id = convertId(ctx.params.id, IdType.IceshrimpId);
            const list = await UserLists.findOneBy({ userId: ctx.user.id, id: id });
            if (!list) throw new MastoApiError(404);

            const body = ctx.request.body as any;
            if (!body['account_ids']) throw new MastoApiError(400, "Missing account_ids[] field");

            const ids = toArray(body['account_ids']).map(p => convertId(p, IdType.IceshrimpId));
            const targets = await Promise.all(ids.map(p => getUser(p)));
            await ListHelpers.addToList(ctx.user, list, targets);
            ctx.body = {}
        },
    );
    router.delete<{ Params: { id: string } }>(
        "/v1/lists/:id/accounts",
        auth(true, ['write:lists']),
        async (ctx, reply) => {
            const id = convertId(ctx.params.id, IdType.IceshrimpId);
            const list = await UserLists.findOneBy({ userId: ctx.user.id, id: id });
            if (!list) throw new MastoApiError(404);

            const body = ctx.request.body as any;
            if (!body['account_ids']) throw new MastoApiError(400, "Missing account_ids[] field");

            const ids = toArray(body['account_ids']).map(p => convertId(p, IdType.IceshrimpId));
            const targets = await Promise.all(ids.map(p => getUser(p)));
            await ListHelpers.removeFromList(ctx.user, list, targets);
            ctx.body = {}
        },
    );
}
