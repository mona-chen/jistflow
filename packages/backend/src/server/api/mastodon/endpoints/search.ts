import { Converter } from "megalodon";
import Router from "@koa/router";
import axios from "axios";
import { argsToBools, convertPaginationArgsIds, limitToInt, normalizeUrlQuery } from "./timeline.js";
import { convertAccountId, convertSearchIds, convertStatusIds } from "../converters.js";
import authenticate from "@/server/api/authenticate.js";
import { UserHelpers } from "@/server/api/mastodon/helpers/user.js";
import { SearchHelpers } from "@/server/api/mastodon/helpers/search.js";

export function setupEndpointsSearch(router: Router): void {
    router.get("/v1/search", async (ctx) => {
        try {
            const auth = await authenticate(ctx.headers.authorization, null);
            const user = auth[0] ?? undefined;

            if (!user) {
                ctx.status = 401;
                return;
            }

            const args = normalizeUrlQuery(convertPaginationArgsIds(argsToBools(limitToInt(ctx.query), ['resolve', 'following', 'exclude_unreviewed'])));
            const cache = UserHelpers.getFreshAccountCache();
            const result = await SearchHelpers.search(user, args.q, args.type, args.resolve, args.following, args.account_id, args['exclude_unreviewed'], args.max_id, args.min_id, args.limit, args.offset, cache);

            ctx.body = {
                ...convertSearchIds(result),
                hashtags: result.hashtags.map(p => p.name),
            };
        } catch (e: any) {
            console.error(e);
            ctx.status = 400;
            ctx.body = {error: e.message};
        }
    });
    router.get("/v2/search", async (ctx) => {
        try {
            const auth = await authenticate(ctx.headers.authorization, null);
            const user = auth[0] ?? undefined;

            if (!user) {
                ctx.status = 401;
                return;
            }

            const args = normalizeUrlQuery(convertPaginationArgsIds(argsToBools(limitToInt(ctx.query), ['resolve', 'following', 'exclude_unreviewed'])));
            const cache = UserHelpers.getFreshAccountCache();
            const result = await SearchHelpers.search(user, args.q, args.type, args.resolve, args.following, args.account_id, args['exclude_unreviewed'], args.max_id, args.min_id, args.limit, args.offset, cache);

            ctx.body = convertSearchIds(result);
        } catch (e: any) {
            console.error(e);
            ctx.status = 400;
            ctx.body = {error: e.message};
        }
    });
    router.get("/v1/trends/statuses", async (ctx) => {
        const BASE_URL = `${ctx.request.protocol}://${ctx.request.hostname}`;
        const accessTokens = ctx.headers.authorization;
        try {
            const data = await getHighlight(
                BASE_URL,
                ctx.request.hostname,
                accessTokens,
            );
            ctx.body = data.map((status) => convertStatusIds(status));
        } catch (e: any) {
            console.error(e);
            ctx.status = 401;
            ctx.body = e.response.data;
        }
    });
    router.get("/v2/suggestions", async (ctx) => {
        const BASE_URL = `${ctx.request.protocol}://${ctx.request.hostname}`;
        const accessTokens = ctx.headers.authorization;
        try {
            const query: any = ctx.query;
            let data = await getFeaturedUser(
                BASE_URL,
                ctx.request.hostname,
                accessTokens,
                query.limit || 20,
            );
            data = data.map((suggestion) => {
                suggestion.account = convertAccountId(suggestion.account);
                return suggestion;
            });
            console.log(data);
            ctx.body = data;
        } catch (e: any) {
            console.error(e);
            ctx.status = 401;
            ctx.body = e.response.data;
        }
    });
}

async function getHighlight(
    BASE_URL: string,
    domain: string,
    accessTokens: string | undefined,
) {
    const accessTokenArr = accessTokens?.split(" ") ?? [null];
    const accessToken = accessTokenArr[accessTokenArr.length - 1];
    try {
        const api = await axios.post(`${BASE_URL}/api/notes/featured`, {
            i: accessToken,
        });
        const data: MisskeyEntity.Note[] = api.data;
        return data.map((note) => new Converter(BASE_URL).note(note, domain));
    } catch (e: any) {
        console.log(e);
        console.log(e.response.data);
        return [];
    }
}

async function getFeaturedUser(
    BASE_URL: string,
    host: string,
    accessTokens: string | undefined,
    limit: number,
) {
    const accessTokenArr = accessTokens?.split(" ") ?? [null];
    const accessToken = accessTokenArr[accessTokenArr.length - 1];
    try {
        const api = await axios.post(`${BASE_URL}/api/users`, {
            i: accessToken,
            limit,
            origin: "local",
            sort: "+follower",
            state: "alive",
        });
        const data: MisskeyEntity.UserDetail[] = api.data;
        console.log(data);
        return data.map((u) => {
            return {
                source: "past_interactions",
                account: new Converter(BASE_URL).userDetail(u, host),
            };
        });
    } catch (e: any) {
        console.log(e);
        console.log(e.response.data);
        return [];
    }
}
