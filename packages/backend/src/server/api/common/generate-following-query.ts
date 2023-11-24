import { Brackets, SelectQueryBuilder } from "typeorm";
import { User } from "@/models/entities/user.js";
import { Followings, Notes } from "@/models/index.js";
import { Cache } from "@/misc/cache.js";
import { apiLogger } from "@/server/api/logger.js";

const cache = new Cache<number>("homeTlQueryData", 60 * 60 * 24);
const cutoff = 250; // 250 posts in the last 7 days, constant determined by comparing benchmarks for cutoff values between 100 and 2500
const logger = apiLogger.createSubLogger("heuristics");

export async function generateFollowingQuery(
	q: SelectQueryBuilder<any>,
	me: { id: User["id"] },
): Promise<void> {
	const followingQuery = Followings.createQueryBuilder("following")
		.select("following.followeeId")
		.where("following.followerId = :meId");

	const heuristic = await cache.fetch(me.id, async () => {
		let curr = new Date();
		let prev = new Date();
		prev.setDate(prev.getDate() - 7);
		return Notes.createQueryBuilder('note')
			.where(`note.createdAt > :prev`, { prev })
			.andWhere(`note.createdAt < :curr`, { curr })
			.andWhere(
				new Brackets((qb) => {
					qb.where(`note.userId IN (${followingQuery.getQuery()})`);
					qb.orWhere(`note.userId = :meId`, { meId: me.id });
				})
			)
			.getCount()
			.then(res => {
				logger.info(`Calculating heuristics for user ${me.id} took ${new Date().getTime() - curr.getTime()}ms`);
				return res;
			});
	});

	const shouldUseUnion = heuristic < cutoff ;

	q.andWhere(
		new Brackets((qb) => {
			if (shouldUseUnion) {
				qb.where(`note.userId = ANY(array(${followingQuery.getQuery()} UNION ALL VALUES (:meId)))`);
			} else {
				qb.where(`note.userId = :meId`);
				qb.orWhere(`note.userId IN (${followingQuery.getQuery()})`);
			}
		}),
	)

	q.setParameters({ meId: me.id });
}
