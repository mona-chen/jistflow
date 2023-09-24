import { ObjectLiteral, SelectQueryBuilder } from "typeorm";
import config from "@/config/index.js";
import { convertId, IdType } from "../../index.js";

export class PaginationHelpers {
	public static makePaginationQuery<T extends ObjectLiteral>(
		q: SelectQueryBuilder<T>,
		sinceId?: string,
		maxId?: string,
		minId?: string
	) {
		if (sinceId && minId) throw new Error("Can't user both sinceId and minId params");

		if (sinceId && maxId) {
			q.andWhere(`${q.alias}.id > :sinceId`, { sinceId: sinceId });
			q.andWhere(`${q.alias}.id < :maxId`, { maxId: maxId });
			q.orderBy(`${q.alias}.id`, "DESC");
		} if (minId && maxId) {
			q.andWhere(`${q.alias}.id > :minId`, { minId: minId });
			q.andWhere(`${q.alias}.id < :maxId`, { maxId: maxId });
			q.orderBy(`${q.alias}.id`, "ASC");
		} else if (sinceId) {
			q.andWhere(`${q.alias}.id > :sinceId`, { sinceId: sinceId });
			q.orderBy(`${q.alias}.id`, "DESC");
		} else if (minId) {
			q.andWhere(`${q.alias}.id > :minId`, { minId: minId });
			q.orderBy(`${q.alias}.id`, "ASC");
		} else if (maxId) {
			q.andWhere(`${q.alias}.id < :maxId`, { maxId: maxId });
			q.orderBy(`${q.alias}.id`, "DESC");
		} else {
			q.orderBy(`${q.alias}.id`, "DESC");
		}
		return q;
	}

	public static appendLinkPaginationHeader(args: any, ctx: any, res: any, route: string): void {
		const link: string[] = [];
		const limit = args.limit ?? 40;
		if (res.maxId) {
			const l = `<${config.url}/api/v1/${route}?limit=${limit}&max_id=${convertId(res.maxId, IdType.MastodonId)}>; rel="next"`;
			link.push(l);
		}
		if (res.minId) {
			const l = `<${config.url}/api/v1/${route}?limit=${limit}&min_id=${convertId(res.minId, IdType.MastodonId)}>; rel="prev"`;
			link.push(l);
		}
		if (link.length > 0){
			ctx.response.append('Link', link.join(', '));
		}
	}
}
