import { fetchProxyAccount } from "@/misc/fetch-proxy-account.js";
import { genId } from "@/misc/gen-id.js";
import type { UserListJoining } from "@/models/entities/user-list-joining.js";
import type { UserList } from "@/models/entities/user-list.js";
import type { User } from "@/models/entities/user.js";
import { UserListJoinings, Users } from "@/models/index.js";
import createFollowing from "@/services/following/create.js";
import { publishUserListStream } from "@/services/stream.js";

export async function pushUserToUserList(target: User, list: UserList) {
	await UserListJoinings.insert({
		id: genId(),
		createdAt: new Date(),
		userId: target.id,
		userListId: list.id,
	} as UserListJoining);

	publishUserListStream(list.id, "userAdded", await Users.pack(target));

	// このインスタンス内にこのリモートユーザーをフォローしているユーザーがいなくても投稿を受け取るためにダミーのユーザーがフォローしたということにする
	if (Users.isRemoteUser(target)) {
		const proxy = await fetchProxyAccount();
		if (proxy) {
			createFollowing(proxy, target);
		}
	}
}
