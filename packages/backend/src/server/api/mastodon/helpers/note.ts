import { makePaginationQuery } from "@/server/api/common/make-pagination-query.js";
import { Metas, Notes } from "@/models/index.js";
import { generateVisibilityQuery } from "@/server/api/common/generate-visibility-query.js";
import { generateMutedUserQuery } from "@/server/api/common/generate-muted-user-query.js";
import { generateBlockedUserQuery } from "@/server/api/common/generate-block-query.js";
import { Note } from "@/models/entities/note.js";
import { ILocalUser } from "@/models/entities/user.js";
import { getNote } from "@/server/api/common/getters.js";
import createReaction from "@/services/note/reaction/create.js";
import deleteReaction from "@/services/note/reaction/delete.js";

export class NoteHelpers {
	public static async getDefaultReaction(): Promise<string> {
		return Metas.createQueryBuilder()
			.select('"defaultReaction"')
			.execute()
			.then(p => p[0].defaultReaction);
	}

	public static async reactToNote(note: Note, user: ILocalUser, reaction: string): Promise<Note> {
		await createReaction(user, note, reaction);
		return getNote(note.id, user);
	}

	public static async removeReactFromNote(note: Note, user: ILocalUser): Promise<Note> {
		await deleteReaction(user, note);
		return getNote(note.id, user);
	}

	public static async getNoteDescendants(note: Note | string, user: ILocalUser | null, limit: number = 10, depth: number = 2): Promise<Note[]> {
		const noteId = typeof note === "string" ? note : note.id;
		const query = makePaginationQuery(Notes.createQueryBuilder("note"))
			.andWhere(
				"note.id IN (SELECT id FROM note_replies(:noteId, :depth, :limit))",
				{noteId, depth, limit},
			);

		generateVisibilityQuery(query, user);
		if (user) {
			generateMutedUserQuery(query, user);
			generateBlockedUserQuery(query, user);
		}

		return query.getMany().then(p => p.reverse());
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

		return notes.reverse();
	}
}
