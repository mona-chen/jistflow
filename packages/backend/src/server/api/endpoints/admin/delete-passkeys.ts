import { UserProfiles, UserSecurityKeys, Users } from "@/models/index.js";
import define from "@/server/api/define.js";
import { publishMainStream } from "@/services/stream.js";

export const meta = {
	tags: ["admin"],

	requireCredential: true,
	requireAdmin: true,

	res: {},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		userId: { type: "string", format: "misskey:id" },
	},
	required: ["userId"],
} as const;

export default define(meta, paramDef, async (ps) => {
	const user = await Users.findOneByOrFail({ id: ps.userId });
	if (user.isDeleted) {
		return;
	}

	await UserSecurityKeys.delete({
		userId: user.id,
	});

	await UserProfiles.update(user.id, {
		usePasswordLessLogin: false,
	});

	const iObj = await Users.pack(user.id, user, {
		detail: true,
		includeSecrets: true,
	});

	publishMainStream(user.id, "meUpdated", iObj);
});
