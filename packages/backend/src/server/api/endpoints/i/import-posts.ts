import define from "../../define.js";
import { ApiError } from "../../error.js";
import { DAY } from "@/const.js";

export const meta = {
	secure: true,
	requireCredential: true,
	limit: {
		duration: DAY * 30,
		max: 2,
	},
	errors: {
		noSuchFile: {
			message: "No such file.",
			code: "NO_SUCH_FILE",
			id: "e674141e-bd2a-ba85-e616-aefb187c9c2a",
		},

		emptyFile: {
			message: "That file is empty.",
			code: "EMPTY_FILE",
			id: "d2f12af1-e7b4-feac-86a3-519548f2728e",
		},

		importsDisabled: {
			message: "Post imports are disabled for security reasons.",
			code: "IMPORTS_DISABLED",
			id: " bc9227e4-fb82-11ed-be56-0242ac120002",
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		fileId: { type: "string", format: "misskey:id" },
		signatureCheck: { type: "boolean" },
	},
	required: ["fileId"],
} as const;

export default define(meta, paramDef, async (ps, user) => {
	throw new ApiError(meta.errors.importsDisabled);
});
