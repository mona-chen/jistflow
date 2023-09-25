import { Note } from "@/models/entities/note.js";
import { ILocalUser, User } from "@/models/entities/user.js";
import { Followings, NoteFavorites, NoteReactions, Notes, UserProfiles } from "@/models/index.js";
import { makePaginationQuery } from "@/server/api/common/make-pagination-query.js";
import { generateRepliesQuery } from "@/server/api/common/generate-replies-query.js";
import { generateVisibilityQuery } from "@/server/api/common/generate-visibility-query.js";
import { generateMutedUserQuery } from "@/server/api/common/generate-muted-user-query.js";
import { generateBlockedUserQuery } from "@/server/api/common/generate-block-query.js";
import { NoteHelpers } from "@/server/api/mastodon/helpers/note.js";
import Entity from "megalodon/src/entity.js";
import AsyncLock from "async-lock";
import { getUser } from "@/server/api/common/getters.js";
import { PaginationHelpers } from "@/server/api/mastodon/helpers/pagination.js";

export type AccountCache = {
	locks: AsyncLock;
	accounts: Entity.Account[];
	users: User[];
};

export type LinkPaginationObject<T> = {
	data: T;
	maxId?: string | undefined;
	minId?: string | undefined;
}

type RelationshipType = 'followers' | 'following';

export class UserHelpers {
	public static async getUserStatuses(user: User, localUser: ILocalUser | null, maxId: string | undefined, sinceId: string | undefined, minId: string | undefined, limit: number = 20, onlyMedia: boolean = false, excludeReplies: boolean = false, excludeReblogs: boolean = false, pinned: boolean = false, tagged: string | undefined): Promise<Note[]> {
		if (limit > 40) limit = 40;

		if (pinned) {
			//FIXME respect pinned
			return [];
		}

		if (tagged !== undefined) {
			//FIXME respect tagged
			return [];
		}

		const query = PaginationHelpers.makePaginationQuery(
			Notes.createQueryBuilder("note"),
			sinceId,
			maxId,
			minId
		)
			.andWhere("note.userId = :userId", { userId: user.id });

		if (excludeReblogs) query.andWhere("(note.renoteId IS NOT NULL) OR (note.text IS NOT NULL)");

		query
			.leftJoinAndSelect("note.renote", "renote");

		//this doesn't exclude replies to your own reply to someone else's post
		//this also breaks when checking your own profile
		//FIXME write new the replies query generator specific to the mastodon client api
		generateRepliesQuery(query, !excludeReplies, localUser);
		generateVisibilityQuery(query, localUser);
		if (localUser) {
			generateMutedUserQuery(query, localUser, user);
			generateBlockedUserQuery(query, localUser);
		}

		if (onlyMedia) query.andWhere("note.fileIds != '{}'");

		query.andWhere("note.visibility != 'hidden'");

		return PaginationHelpers.execQuery(query, limit, minId !== undefined);
	}

	public static async getUserBookmarks(localUser: ILocalUser, maxId: string | undefined, sinceId: string | undefined, minId: string | undefined, limit: number = 20): Promise<LinkPaginationObject<Note[]>> {
		if (limit > 40) limit = 40;

		const query = PaginationHelpers.makePaginationQuery(
			NoteFavorites.createQueryBuilder("favorite"),
			sinceId,
			maxId,
			minId
		)
			.andWhere("favorite.userId = :meId", { meId: localUser.id })
			.leftJoinAndSelect("favorite.note", "note");

		generateVisibilityQuery(query, localUser);

		return PaginationHelpers.execQuery(query, limit, minId !== undefined)
			.then(res => {
				return {
					data: res.map(p => p.note as Note),
					maxId: res.map(p => p.id).at(-1),
					minId: res.map(p => p.id)[0],
				};
			});
	}

	public static async getUserFavorites(localUser: ILocalUser, maxId: string | undefined, sinceId: string | undefined, minId: string | undefined, limit: number = 20): Promise<LinkPaginationObject<Note[]>> {
		if (limit > 40) limit = 40;

		const query = PaginationHelpers.makePaginationQuery(
			NoteReactions.createQueryBuilder("reaction"),
			sinceId,
			maxId,
			minId
		)
			.andWhere("reaction.userId = :meId", { meId: localUser.id })
			.leftJoinAndSelect("reaction.note", "note");

		generateVisibilityQuery(query, localUser);

		return PaginationHelpers.execQuery(query, limit, minId !== undefined)
			.then(res => {
				return {
					data: res.map(p => p.note as Note),
					maxId: res.map(p => p.id).at(-1),
					minId: res.map(p => p.id)[0],
				};
			});
	}

	private static async getUserRelationships(type: RelationshipType, user: User, localUser: ILocalUser | null, maxId: string | undefined, sinceId: string | undefined, minId: string | undefined, limit: number = 40): Promise<LinkPaginationObject<User[]>> {
		if (limit > 80) limit = 80;

		const profile = await UserProfiles.findOneByOrFail({ userId: user.id });
		if (profile.ffVisibility === "private") {
			if (!localUser || user.id !== localUser.id) return { data: [] };
		}
		else if (profile.ffVisibility === "followers") {
			if (!localUser) return { data: [] };
			if (user.id !== localUser.id) {
				const isFollowed = await Followings.exist({
					where: {
						followeeId: user.id,
						followerId: localUser.id,
					},
				});
				if (!isFollowed) return { data: [] };
			}
		}

		const query = PaginationHelpers.makePaginationQuery(
			Followings.createQueryBuilder("following"),
			sinceId,
			maxId,
			minId
		);

		if (type === "followers") {
			query.andWhere("following.followeeId = :userId", {userId: user.id})
				.innerJoinAndSelect("following.follower", "follower");
		} else {
			query.andWhere("following.followerId = :userId", {userId: user.id})
				.innerJoinAndSelect("following.followee", "followee");
		}

		return query.take(limit).getMany().then(p => {
			if (minId !== undefined) p = p.reverse();

			return {
				data: p.map(p => type === "followers" ? p.follower : p.followee).filter(p => p) as User[],
				maxId: p.map(p => p.id).at(-1),
				minId: p.map(p => p.id)[0],
			};
		});
	}

	public static async getUserFollowers(user: User, localUser: ILocalUser | null, maxId: string | undefined, sinceId: string | undefined, minId: string | undefined, limit: number = 40): Promise<LinkPaginationObject<User[]>> {
		return this.getUserRelationships('followers', user, localUser, maxId, sinceId, minId, limit);
	}

	public static async getUserFollowing(user: User, localUser: ILocalUser | null, maxId: string | undefined, sinceId: string | undefined, minId: string | undefined, limit: number = 40): Promise<LinkPaginationObject<User[]>> {
		return this.getUserRelationships('following', user, localUser, maxId, sinceId, minId, limit);
	}

	public static async getUserCached(id: string, cache: AccountCache = UserHelpers.getFreshAccountCache()): Promise<User> {
		return cache.locks.acquire(id, async () => {
			const cacheHit = cache.users.find(p => p.id == id);
			if (cacheHit) return cacheHit;
			return getUser(id).then(p => {
				cache.users.push(p);
				return p;
			});
		});
	}

	public static getFreshAccountCache(): AccountCache {
		return {
			locks: new AsyncLock(),
			accounts: [],
			users: [],
		};
	}
}
