import { publishUserEvent, publishUserListStream } from "@/services/stream.js";
import type { User } from "@/models/entities/user.js";
import type { UserList } from "@/models/entities/user-list.js";
import { UserListJoinings, Users } from "@/models/index.js";
import type { UserListJoining } from "@/models/entities/user-list-joining.js";
import { genId } from "@/misc/gen-id.js";

export async function pushUserToUserList(target: User, list: UserList) {
	await UserListJoinings.insert({
		id: genId(),
		createdAt: new Date(),
		userId: target.id,
		userListId: list.id,
	} as UserListJoining);

	const packed = await Users.pack(target);
	publishUserListStream(list.id, "userAdded", packed);
	if (list.hideFromHomeTl) publishUserEvent(list.userId, "userHidden", target.id);
}
