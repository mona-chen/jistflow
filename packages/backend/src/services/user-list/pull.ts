import { publishUserEvent, publishUserListStream } from "@/services/stream.js";
import type { User } from "@/models/entities/user.js";
import type { UserList } from "@/models/entities/user-list.js";
import { UserListJoinings, Users } from "@/models/index.js";

export async function pullUserFromUserList(target: User, list: UserList) {
	await UserListJoinings.delete({ userListId: list.id, userId: target.id });

	const packed = await Users.pack(target);
	publishUserListStream(list.id, "userRemoved", packed);
	if (list.hideFromHomeTl) publishUserEvent(list.userId, "userUnhidden", target.id);
}