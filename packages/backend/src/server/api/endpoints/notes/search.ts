import { Notes } from "@/models/index.js";
import { Note } from "@/models/entities/note.js";
import define from "../../define.js";
import { makePaginationQuery } from "../../common/make-pagination-query.js";
import { generateVisibilityQuery } from "../../common/generate-visibility-query.js";
import { generateMutedUserQuery } from "../../common/generate-muted-user-query.js";
import { generateBlockedUserQuery } from "../../common/generate-block-query.js";
import { sqlLikeEscape } from "@/misc/sql-like-escape.js";
import { generateFtsQuery } from "@/server/api/common/generate-fts-query.js";

export const meta = {
	tags: ["notes"],

	requireCredential: true,
	requireCredentialPrivateMode: true,

	res: {
		type: "array",
		optional: false,
		nullable: false,
		items: {
			type: "object",
			optional: false,
			nullable: false,
			ref: "Note",
		},
	},

	errors: {},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		query: { type: "string" },
		sinceId: { type: "string", format: "misskey:id" },
		untilId: { type: "string", format: "misskey:id" },
		limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
		offset: { type: "integer", default: 0 },
		host: {
			type: "string",
			nullable: true,
			description: "The local host is represented with `null`.",
		},
		userId: {
			type: "string",
			format: "misskey:id",
			nullable: true,
			default: null,
		},
		channelId: {
			type: "string",
			format: "misskey:id",
			nullable: true,
			default: null,
		},
	},
	required: ["query"],
} as const;

export default define(meta, paramDef, async (ps, me) => {
	const query = makePaginationQuery(
		Notes.createQueryBuilder("note"),
		ps.sinceId,
		ps.untilId,
	);

	if (ps.userId) {
		query.andWhere("note.userId = :userId", { userId: ps.userId });
	} else if (ps.channelId) {
		query.andWhere("note.channelId = :channelId", {
			channelId: ps.channelId,
		});
	}

	query
		.innerJoinAndSelect("note.user", "user")
		.leftJoinAndSelect("note.reply", "reply")
		.leftJoinAndSelect("note.renote", "renote")
		.leftJoinAndSelect("reply.user", "replyUser")
		.leftJoinAndSelect("renote.user", "renoteUser");

	generateFtsQuery(query, ps.query);
	generateVisibilityQuery(query, me);
	generateMutedUserQuery(query, me);
	generateBlockedUserQuery(query, me);
	query.setParameter("meId", me.id);

	return await query.take(ps.limit).getMany().then(notes => Notes.packMany(notes, me));
});
