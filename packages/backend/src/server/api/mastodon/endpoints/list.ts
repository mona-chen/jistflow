import Router from "@koa/router";
import { limitToInt, normalizeUrlQuery } from "@/server/api/mastodon/endpoints/timeline.js";
import { ListHelpers } from "@/server/api/mastodon/helpers/list.js";
import { UserConverter } from "@/server/api/mastodon/converters/user.js";
import { UserLists } from "@/models/index.js";
import { getUser } from "@/server/api/common/getters.js";
import { toArray } from "@/prelude/array.js";
import { auth } from "@/server/api/mastodon/middleware/auth.js";
import { MastoApiError } from "@/server/api/mastodon/middleware/catch-errors.js";

export function setupEndpointsList(router: Router): void {
    router.get("/v1/lists",
        auth(true, ['read:lists']),
        async (ctx, reply) => {
            ctx.body = await ListHelpers.getLists(ctx);
        }
    );
    router.get<{ Params: { id: string } }>(
        "/v1/lists/:id",
        auth(true, ['read:lists']),
        async (ctx, reply) => {
            ctx.body = await ListHelpers.getListOr404(ctx.params.id, ctx);
        },
    );
    router.post("/v1/lists",
        auth(true, ['write:lists']),
        async (ctx, reply) => {
            const body = ctx.request.body as any;
            const title = (body.title ?? '').trim();
            ctx.body = await ListHelpers.createList(title, ctx);
        }
    );
    router.put<{ Params: { id: string } }>(
        "/v1/lists/:id",
        auth(true, ['write:lists']),
        async (ctx, reply) => {
            const list = await UserLists.findOneBy({ userId: ctx.user.id, id: ctx.params.id });
            if (!list) throw new MastoApiError(404);

            const body = ctx.request.body as any;
            const title = (body.title ?? '').trim();
            const exclusive = body.exclusive ?? undefined as boolean | undefined;
            ctx.body = await ListHelpers.updateList(list, title, exclusive, ctx);
        },
    );
    router.delete<{ Params: { id: string } }>(
        "/v1/lists/:id",
        auth(true, ['write:lists']),
        async (ctx, reply) => {
            const list = await UserLists.findOneBy({ userId: ctx.user.id, id: ctx.params.id });
            if (!list) throw new MastoApiError(404);

            await ListHelpers.deleteList(list, ctx);
            ctx.body = {};
        },
    );
    router.get<{ Params: { id: string } }>(
        "/v1/lists/:id/accounts",
        auth(true, ['read:lists']),
        async (ctx, reply) => {
            const args = normalizeUrlQuery(limitToInt(ctx.query));
            const res = await ListHelpers.getListUsers(ctx.params.id, args.max_id, args.since_id, args.min_id, args.limit, ctx);
            ctx.body = await UserConverter.encodeMany(res, ctx);
        },
    );
    router.post<{ Params: { id: string } }>(
        "/v1/lists/:id/accounts",
        auth(true, ['write:lists']),
        async (ctx, reply) => {
            const list = await UserLists.findOneBy({ userId: ctx.user.id, id: ctx.params.id });
            if (!list) throw new MastoApiError(404);

            const body = ctx.request.body as any;
            if (!body['account_ids']) throw new MastoApiError(400, "Missing account_ids[] field");

            const ids = toArray(body['account_ids']);
            const targets = await Promise.all(ids.map(p => getUser(p)));
            await ListHelpers.addToList(list, targets, ctx);
            ctx.body = {}
        },
    );
    router.delete<{ Params: { id: string } }>(
        "/v1/lists/:id/accounts",
        auth(true, ['write:lists']),
        async (ctx, reply) => {
            const list = await UserLists.findOneBy({ userId: ctx.user.id, id: ctx.params.id });
            if (!list) throw new MastoApiError(404);

            const body = ctx.request.body as any;
            if (!body['account_ids']) throw new MastoApiError(400, "Missing account_ids[] field");

            const ids = toArray(body['account_ids']);
            const targets = await Promise.all(ids.map(p => getUser(p)));
            await ListHelpers.removeFromList(list, targets, ctx);
            ctx.body = {}
        },
    );
}
