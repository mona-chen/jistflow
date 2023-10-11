import { ObjectLiteral, SelectQueryBuilder } from "typeorm";
import { MastoContext } from "@/server/api/mastodon/index.js";
import { generatePaginationData } from "@/server/api/mastodon/middleware/pagination.js";

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
            q.andWhere(`${idField} > :sinceId`, { sinceId: sinceId });
            q.andWhere(`${idField} < :maxId`, { maxId: maxId });
            q.orderBy(`${idField}`, "DESC");
        }
        if (minId && maxId) {
            q.andWhere(`${idField} > :minId`, { minId: minId });
            q.andWhere(`${idField} < :maxId`, { maxId: maxId });
            q.orderBy(`${idField}`, "ASC");
        } else if (sinceId) {
            q.andWhere(`${idField} > :sinceId`, { sinceId: sinceId });
            q.orderBy(`${idField}`, "DESC");
        } else if (minId) {
            q.andWhere(`${idField} > :minId`, { minId: minId });
            q.orderBy(`${idField}`, "ASC");
        } else if (maxId) {
            q.andWhere(`${idField} < :maxId`, { maxId: maxId });
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
        return query.take(limit).getMany().then(found => reverse ? found.reverse() : found);
    }

    public static async execQueryLinkPagination<T extends ObjectLiteral>(query: SelectQueryBuilder<T>, limit: number, reverse: boolean, ctx: MastoContext): Promise<T[]> {
        return this.execQuery(query, limit, reverse)
            .then(p => {
                ctx.pagination = generatePaginationData(p.map(x => x.id), limit);
                return p;
            });
    }
}
