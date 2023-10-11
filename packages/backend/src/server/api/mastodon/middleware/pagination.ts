import { MastoContext } from "@/server/api/mastodon/index.js";
import config from "@/config/index.js";

type PaginationData = {
    limit: number;
    maxId?: string | undefined;
    minId?: string | undefined;
}

export async function PaginationMiddleware(ctx: MastoContext, next: () => Promise<any>) {
    await next();
    if (!ctx.pagination) return;

    const link: string[] = [];
    const limit = ctx.pagination.limit;
    if (ctx.pagination.maxId) {
        const l = `<${config.url}/api${ctx.path}?limit=${limit}&max_id=${ctx.pagination.maxId}>; rel="next"`;
        link.push(l);
    }
    if (ctx.pagination.minId) {
        const l = `<${config.url}/api${ctx.path}?limit=${limit}&min_id=${ctx.pagination.minId}>; rel="prev"`;
        link.push(l);
    }
    if (link.length > 0) {
        ctx.response.append('Link', link.join(', '));
    }
}

export function generatePaginationData(ids: string[], limit: number): PaginationData | undefined {
    if (ids.length < 1) return undefined;

    return {
        limit: limit,
        maxId: ids.length < limit ? undefined : ids.at(-1),
        minId: ids.at(0)
    }
}
