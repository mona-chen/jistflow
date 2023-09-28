import { Note } from "@/models/entities/note.js";
import { ILocalUser, User } from "@/models/entities/user.js";
import {
	Blockings,
	Followings,
	FollowRequests,
	Mutings,
	NoteFavorites,
	NoteReactions,
	Notes,
	NoteWatchings,
	UserProfiles,
	Users
} from "@/models/index.js";
import { generateRepliesQuery } from "@/server/api/common/generate-replies-query.js";
import { generateVisibilityQuery } from "@/server/api/common/generate-visibility-query.js";
import { generateMutedUserQuery } from "@/server/api/common/generate-muted-user-query.js";
import { generateBlockedUserQuery } from "@/server/api/common/generate-block-query.js";
import Entity from "megalodon/src/entity.js";
import AsyncLock from "async-lock";
import { getUser } from "@/server/api/common/getters.js";
import { PaginationHelpers } from "@/server/api/mastodon/helpers/pagination.js";
import { awaitAll } from "@/prelude/await-all.js";
import createFollowing from "@/services/following/create.js";
import deleteFollowing from "@/services/following/delete.js";
import cancelFollowRequest from "@/services/following/requests/cancel.js";
import createBlocking from "@/services/blocking/create.js";
import deleteBlocking from "@/services/blocking/delete.js";
import { genId } from "@/misc/gen-id.js";
import { Muting } from "@/models/entities/muting.js";
import { publishUserEvent } from "@/services/stream.js";
import { UserConverter } from "@/server/api/mastodon/converters/user.js";
import { convertId, IdType } from "@/misc/convert-id.js";

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
	public static async followUser(target: User, localUser: ILocalUser, reblogs: boolean, notify: boolean) {
		//FIXME: implement reblogs & notify params
		const following = await Followings.exist({where: {followerId: localUser.id, followeeId: target.id}});
		const requested = await FollowRequests.exist({where: {followerId: localUser.id, followeeId: target.id}});
		if (!following && !requested)
			await createFollowing(localUser, target);

		return this.getUserRelationshipTo(target.id, localUser.id);
	}

	public static async unfollowUser(target: User, localUser: ILocalUser) {
		const following = await Followings.exist({where: {followerId: localUser.id, followeeId: target.id}});
		const requested = await FollowRequests.exist({where: {followerId: localUser.id, followeeId: target.id}});
		if (following)
			await deleteFollowing(localUser, target);
		if (requested)
			await cancelFollowRequest(target, localUser);

		return this.getUserRelationshipTo(target.id, localUser.id);
	}

	public static async blockUser(target: User, localUser: ILocalUser) {
		const blocked = await Blockings.exist({where: {blockerId: localUser.id, blockeeId: target.id}});
		if (!blocked)
			await createBlocking(localUser, target);

		return this.getUserRelationshipTo(target.id, localUser.id);
	}

	public static async unblockUser(target: User, localUser: ILocalUser) {
		const blocked = await Blockings.exist({where: {blockerId: localUser.id, blockeeId: target.id}});
		if (blocked)
			await deleteBlocking(localUser, target);

		return this.getUserRelationshipTo(target.id, localUser.id);
	}

	public static async muteUser(target: User, localUser: ILocalUser, notifications: boolean = true, duration: number = 0) {
		//FIXME: respect notifications parameter
		const muted = await Mutings.exist({where: {muterId: localUser.id, muteeId: target.id}});
		if (!muted) {
			await Mutings.insert({
				id: genId(),
				createdAt: new Date(),
				expiresAt: duration === 0 ? null : new Date(new Date().getTime() + (duration * 1000)),
				muterId: localUser.id,
				muteeId: target.id,
			} as Muting);

			publishUserEvent(localUser.id, "mute", target);

			NoteWatchings.delete({
				userId: localUser.id,
				noteUserId: target.id,
			});
		}

		return this.getUserRelationshipTo(target.id, localUser.id);
	}

	public static async unmuteUser(target: User, localUser: ILocalUser) {
		const muting = await Mutings.findOneBy({muterId: localUser.id, muteeId: target.id});
		if (muting) {
			await Mutings.delete({
				id: muting.id,
			});

			publishUserEvent(localUser.id, "unmute", target);
		}

		return this.getUserRelationshipTo(target.id, localUser.id);
	}

	public static async getUserMutes(user: ILocalUser, maxId: string | undefined, sinceId: string | undefined, minId: string | undefined, limit: number = 40, cache: AccountCache = UserHelpers.getFreshAccountCache()): Promise<LinkPaginationObject<MastodonEntity.MutedAccount[]>> {
		if (limit > 80) limit = 80;

		const query = PaginationHelpers.makePaginationQuery(
			Mutings.createQueryBuilder("muting"),
			sinceId,
			maxId,
			minId
		);

		query.andWhere("muting.muterId = :userId", {userId: user.id})
			.innerJoinAndSelect("muting.mutee", "mutee");

		return query.take(limit).getMany().then(async p => {
			if (minId !== undefined) p = p.reverse();
			const users = p
				.map(p =>  p.mutee)
				.filter(p => p) as User[];

			const result = await UserConverter.encodeMany(users, cache)
				.then(res => res.map(m => {
					const muting = p.find(acc => acc.muteeId === m.id);
					return {
						...m,
						mute_expires_at: muting?.expiresAt?.toISOString() ?? null
					} as MastodonEntity.MutedAccount
				}));

			return {
				data: result,
				maxId: p.map(p => p.id).at(-1),
				minId: p.map(p => p.id)[0],
			};
		});
	}

	public static async getUserBlocks(user: ILocalUser, maxId: string | undefined, sinceId: string | undefined, minId: string | undefined, limit: number = 40): Promise<LinkPaginationObject<User[]>> {
		if (limit > 80) limit = 80;

		const query = PaginationHelpers.makePaginationQuery(
			Blockings.createQueryBuilder("blocking"),
			sinceId,
			maxId,
			minId
		);

		query.andWhere("blocking.blockerId = :userId", {userId: user.id})
			.innerJoinAndSelect("blocking.blockee", "blockee");

		return query.take(limit).getMany().then(async p => {
			if (minId !== undefined) p = p.reverse();
			const users = p
				.map(p =>  p.blockee)
				.filter(p => p) as User[];

			return {
				data: users,
				maxId: p.map(p => p.id).at(-1),
				minId: p.map(p => p.id)[0],
			};
		});
	}

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

	public static async getUserRelationhipToMany(targetIds: string[], localUserId: string): Promise<MastodonEntity.Relationship[]> {
		return Promise.all(targetIds.map(targetId => this.getUserRelationshipTo(targetId, localUserId)));
	}

	public static async getUserRelationshipTo(targetId: string, localUserId: string): Promise<MastodonEntity.Relationship> {
		const relation = await Users.getRelation(localUserId, targetId);
		const response = {
			id: targetId,
			following: relation.isFollowing,
			followed_by: relation.isFollowed,
			blocking: relation.isBlocking,
			blocked_by: relation.isBlocked,
			muting: relation.isMuted,
			muting_notifications: relation.isMuted,
			requested: relation.hasPendingFollowRequestFromYou,
			domain_blocking: false, //FIXME
			showing_reblogs: !relation.isRenoteMuted,
			endorsed: false,
			notifying: false, //FIXME
			note: '' //FIXME
		}

		return awaitAll(response);
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
