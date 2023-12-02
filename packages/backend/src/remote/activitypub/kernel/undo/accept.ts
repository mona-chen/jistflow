import type { CacheableRemoteUser } from "@/models/entities/user.js";
import { Followings } from "@/models/index.js";
import unfollow from "@/services/following/delete.js";
import DbResolver from "../../db-resolver.js";
import type { IAccept } from "../../type.js";

export default async (
	actor: CacheableRemoteUser,
	activity: IAccept,
): Promise<string> => {
	const dbResolver = new DbResolver();

	const follower = await dbResolver.getUserFromApId(activity.object);
	if (follower == null) {
		return "skip: follower not found";
	}

	const following = await Followings.findOneBy({
		followerId: follower.id,
		followeeId: actor.id,
	});

	if (following) {
		await unfollow(follower, actor);
		return "ok: unfollowed";
	}

	return "skip: skip: not followed";
};
