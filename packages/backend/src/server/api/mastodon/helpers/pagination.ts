import { ObjectLiteral, SelectQueryBuilder } from "typeorm";
import config from "@/config/index.js";
import { convertId, IdType } from "../../index.js";

export class PaginationHelpers {
    public static makePaginationQuery<T extends ObjectLiteral>(
        q: SelectQueryBuilder<T>,
        sinceId?: string,
        maxId?: string,
        minId?: string,
        idField: string = `${q.alias}.id`,
    ) {
        if (sinceId && minId) throw new Error("Can't user both sinceId and minId params");

        if (sinceId && maxId) {
            q.andWhere(`${idField} > :sinceId`, {sinceId: sinceId});
            q.andWhere(`${idField} < :maxId`, {maxId: maxId});
            q.orderBy(`${idField}`, "DESC");
        }
        if (minId && maxId) {
            q.andWhere(`${idField} > :minId`, {minId: minId});
            q.andWhere(`${idField} < :maxId`, {maxId: maxId});
            q.orderBy(`${idField}`, "ASC");
        } else if (sinceId) {
            q.andWhere(`${idField} > :sinceId`, {sinceId: sinceId});
            q.orderBy(`${idField}`, "DESC");
        } else if (minId) {
            q.andWhere(`${idField} > :minId`, {minId: minId});
            q.orderBy(`${idField}`, "ASC");
        } else if (maxId) {
            q.andWhere(`${idField} < :maxId`, {maxId: maxId});
            q.orderBy(`${idField}`, "DESC");
        } else {
            q.orderBy(`${idField}`, "DESC");
        }
        return q;
    }

    /**
     *
     * @param query
     * @param limit
     * @param reverse whether the result needs to be .reverse()'d. Set this to true when the parameter minId is not undefined in the original request.
     */
    public static async execQuery<T extends ObjectLiteral>(query: SelectQueryBuilder<T>, limit: number, reverse: boolean): Promise<T[]> {
        // We fetch more than requested because some may be filtered out, and if there's less than
        // requested, the pagination stops.
        const found = [];
        const take = Math.floor(limit * 1.5);
        let skip = 0;
        try {
            while (found.length < limit) {
                const notes = await query.take(take).skip(skip).getMany();
                found.push(...notes);
                skip += take;
                if (notes.length < take) break;
            }
        } catch (error) {
            return [];
        }

        if (found.length > limit) {
            found.length = limit;
        }

        return reverse ? found.reverse() : found;
    }

    public static appendLinkPaginationHeader(args: any, ctx: any, res: any, defaultLimit: number): void {
        const link: string[] = [];
        const limit = args.limit ?? defaultLimit;
        if (res.maxId) {
            const l = `<${config.url}/api${ctx.path}?limit=${limit}&max_id=${convertId(res.maxId, IdType.MastodonId)}>; rel="next"`;
            link.push(l);
        }
        if (res.minId) {
            const l = `<${config.url}/api${ctx.path}?limit=${limit}&min_id=${convertId(res.minId, IdType.MastodonId)}>; rel="prev"`;
            link.push(l);
        }
        if (link.length > 0) {
            ctx.response.append('Link', link.join(', '));
        }
    }
}
