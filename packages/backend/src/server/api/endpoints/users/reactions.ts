import { NoteReactions, UserProfiles } from "@/models/index.js";
import define from "@/server/api/define.js";
import { makePaginationQuery } from "@/server/api/common/make-pagination-query.js";
import { generateVisibilityQuery } from "@/server/api/common/generate-visibility-query.js";
import { ApiError } from "@/server/api/error.js";

export const meta = {
	tags: ["users", "reactions"],

	requireCredential: false,
	requireCredentialPrivateMode: true,

	description: "Show all reactions this user made.",

	res: {
		type: "array",
		optional: false,
		nullable: false,
		items: {
			type: "object",
			optional: false,
			nullable: false,
			ref: "NoteReaction",
		},
	},

	errors: {
		reactionsNotPublic: {
			message: "Reactions of the user is not public.",
			code: "REACTIONS_NOT_PUBLIC",
			id: "673a7dd2-6924-1093-e0c0-e68456ceae5c",
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		userId: { type: "string", format: "misskey:id" },
		limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
		sinceId: { type: "string", format: "misskey:id" },
		untilId: { type: "string", format: "misskey:id" },
		sinceDate: { type: "integer" },
		untilDate: { type: "integer" },
	},
	required: ["userId"],
} as const;

export default define(meta, paramDef, async (ps, me) => {
	const profile = await UserProfiles.findOneByOrFail({ userId: ps.userId });

	if (!profile.publicReactions && (me == null || me.id !== ps.userId)) {
		throw new ApiError(meta.errors.reactionsNotPublic);
	}

	const query = makePaginationQuery(
		NoteReactions.createQueryBuilder("reaction"),
		ps.sinceId,
		ps.untilId,
		ps.sinceDate,
		ps.untilDate,
	)
		.andWhere("reaction.userId = :userId", { userId: ps.userId })
		.leftJoinAndSelect("reaction.note", "note");

	generateVisibilityQuery(query, me);

	const reactions = await query.take(ps.limit).getMany();

	return await NoteReactions.packMany(reactions, me, { withNote: true });
});
