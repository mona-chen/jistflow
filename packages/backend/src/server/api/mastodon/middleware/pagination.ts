import { MastoContext } from "@/server/api/mastodon/index.js";
import config from "@/config/index.js";
import { convertId, IdType } from "@/misc/convert-id.js";

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