import { UserListJoinings, UserLists, Users } from "@/models/index.js";
import define from "../../../define.js";
import { ApiError } from "../../../error.js";
import { publishUserEvent } from "@/services/stream.js";

export const meta = {
	tags: ["lists"],

	requireCredential: true,

	kind: "write:account",

	description: "Update the properties of a list.",

	res: {
		type: "object",
		optional: false,
		nullable: false,
		ref: "UserList",
	},

	errors: {
		noSuchList: {
			message: "No such list.",
			code: "NO_SUCH_LIST",
			id: "796666fe-3dff-4d39-becb-8a5932c1d5b7",
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		listId: { type: "string", format: "misskey:id" },
		name: { type: "string", minLength: 1, maxLength: 100 },
		hideFromHomeTl: { type: "boolean", nullable: true },
	},
	required: ["listId"],
} as const;

export default define(meta, paramDef, async (ps, user) => {
	// Fetch the list
	const userList = await UserLists.findOneBy({
		id: ps.listId,
		userId: user.id,
	});

	if (userList == null) {
		throw new ApiError(meta.errors.noSuchList);
	}

	const partial = {
		name: ps.name ?? undefined,
		hideFromHomeTl: ps.hideFromHomeTl ?? undefined
	};
	if (Object.keys(partial).length > 0) await UserLists.update(userList.id, partial);

	if (ps.hideFromHomeTl != null) {
		UserListJoinings.findBy({ userListId: ps.listId })
			.then(members => {
				for (const member of members) {
					publishUserEvent(userList.userId, ps.hideFromHomeTl ? "userHidden" : "userUnhidden", member.userId);
				}
			});
	}

	return await UserLists.pack(userList.id);
});
