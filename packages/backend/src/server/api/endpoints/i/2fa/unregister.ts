import { comparePassword } from "@/misc/password.js";
import { UserProfiles, Users } from "@/models/index.js";
import define from "@/server/api/define.js";
import { publishMainStream } from "@/services/stream.js";

export const meta = {
	requireCredential: true,

	secure: true,
} as const;

export const paramDef = {
	type: "object",
	properties: {
		password: { type: "string" },
	},
	required: ["password"],
} as const;

export default define(meta, paramDef, async (ps, user) => {
	const profile = await UserProfiles.findOneByOrFail({ userId: user.id });

	// Compare password
	const same = await comparePassword(ps.password, profile.password!);

	if (!same) {
		throw new Error("incorrect password");
	}

	await UserProfiles.update(user.id, {
		twoFactorSecret: null,
		twoFactorEnabled: false,
		usePasswordLessLogin: false,
	});

	const iObj = await Users.pack(user.id, user, {
		detail: true,
		includeSecrets: true,
	});

	publishMainStream(user.id, "meUpdated", iObj);
});
