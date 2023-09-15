import { makePaginationQuery } from "@/server/api/common/make-pagination-query.js";
import { Notes } from "@/models/index.js";
import { generateVisibilityQuery } from "@/server/api/common/generate-visibility-query.js";
import { generateMutedUserQuery } from "@/server/api/common/generate-muted-user-query.js";
import { generateBlockedUserQuery } from "@/server/api/common/generate-block-query.js";
import { Note } from "@/models/entities/note.js";
import { ILocalUser } from "@/models/entities/user.js";
import querystring from "node:querystring";
import { getNote } from "@/server/api/common/getters.js";
import { SelectQueryBuilder } from "typeorm";

export class NoteHelpers {
	public static async getNoteDescendants(note: Note | string, user: ILocalUser | null, limit: number = 10, depth: number = 2): Promise<Note[]> {
		const noteId = typeof note === "string" ? note : note.id;
		const query = makePaginationQuery(Notes.createQueryBuilder("note"))
			.andWhere(
				"note.id IN (SELECT id FROM note_replies(:noteId, :depth, :limit))",
				{noteId, depth, limit},
			)
			.innerJoinAndSelect("note.user", "user")
			.leftJoinAndSelect("user.avatar", "avatar")
			.leftJoinAndSelect("user.banner", "banner");

		generateVisibilityQuery(query, user);
		if (user) {
			generateMutedUserQuery(query, user);
			generateBlockedUserQuery(query, user);
		}

		return query.getMany();
	}

	public static async getNoteAncestors(rootNote: Note, user: ILocalUser | null, limit: number = 10): Promise<Note[]> {
		const notes = new Array<Note>;
		for (let i = 0; i < limit; i++) {
			const currentNote = notes.at(-1) ?? rootNote;
			if (!currentNote.replyId) break;
			const nextNote = await getNote(currentNote.replyId, user).catch((e) => {
				if (e.id === "9725d0ce-ba28-4dde-95a7-2cbb2c15de24") return null;
				throw e;
			});
			if (nextNote && await Notes.isVisibleForMe(nextNote, user?.id ?? null)) notes.push(nextNote);
			else break;
		}

		return notes;
	}

	public static async execQuery(query: SelectQueryBuilder<Note>, limit: number): Promise<Note[]> {
		// We fetch more than requested because some may be filtered out, and if there's less than
		// requested, the pagination stops.
		const found = [];
		const take = Math.floor(limit * 1.5);
		let skip = 0;
		try {
			while (found.length < limit) {
				const notes = await query.take(take).skip(skip).getMany();
				found.push(...notes);
				skip += take;
				if (notes.length < take) break;
			}
		} catch (error) {
			return [];
		}

		if (found.length > limit) {
			found.length = limit;
		}

		return found;
	}
}
