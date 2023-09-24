import { ObjectLiteral, SelectQueryBuilder } from "typeorm";

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
}
