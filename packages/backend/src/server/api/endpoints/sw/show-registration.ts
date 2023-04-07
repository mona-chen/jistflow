import { SwSubscriptions } from "@/models/index.js";
import define from "../../define.js";

export const meta = {
	tags: ["account"],

	requireCredential: true,

	description: "Check push notification registration exists.",

	res: {
		type: "object",
		optional: false,
		nullable: true,
		properties: {
			userId: {
				type: "string",
				optional: false,
				nullable: false,
			},
			endpoint: {
				type: "string",
				optional: false,
				nullable: false,
			},
			sendReadMessage: {
				type: "boolean",
				optional: false,
				nullable: false,
			},
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		endpoint: { type: "string" },
	},
	required: ["endpoint"],
} as const;

// eslint-disable-next-line import/no-default-export
export default define(meta, paramDef, async (ps, me) => {
	const exist = await SwSubscriptions.findOneBy({
		userId: me.id,
		endpoint: ps.endpoint,
	});

	if (exist != null) {
		return {
			userId: exist.userId,
			endpoint: exist.endpoint,
			sendReadMessage: exist.sendReadMessage,
		};
	}

	return null;
});
