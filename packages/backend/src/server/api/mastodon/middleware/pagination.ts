import { MastoContext } from "@/server/api/mastodon/index.js";
import config from "@/config/index.js";
import { convertId, IdType } from "@/misc/convert-id.js";
import { ObjectLiteral } from "typeorm";

type PaginationData = {
    limit: number;
    maxId?: string | undefined;
    minId?: string | undefined;
}

export type LinkPaginationObject<T> = {
    data: T;
    pagination?: PaginationData;
}

export async function PaginationMiddleware(ctx: MastoContext, next: () => Promise<any>) {
    await next();
    if (!ctx.pagination) return;

    const link: string[] = [];
    const limit = ctx.pagination.limit;
    if (ctx.pagination.maxId) {
        const l = `<${config.url}/api${ctx.path}?limit=${limit}&max_id=${convertId(ctx.pagination.maxId, IdType.MastodonId)}>; rel="next"`;
        link.push(l);
    }
    if (ctx.pagination.minId) {
        const l = `<${config.url}/api${ctx.path}?limit=${limit}&min_id=${convertId(ctx.pagination.maxId, IdType.MastodonId)}>; rel="prev"`;
        link.push(l);
    }
    if (link.length > 0) {
        ctx.response.append('Link', link.join(', '));
    }
}

export function generatePaginationData(ids: string[], limit: number, reverse: boolean): PaginationData | undefined {
    if (ids.length < 1) return undefined;

    return {
        limit: limit,
        maxId: ids.at(reverse ? 0 : -1),
        minId: ids.at(reverse ? -1 : 0)
    }
}