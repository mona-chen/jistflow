import { genId } from "@/misc/gen-id.js";
import type { NoteWatching } from "@/models/entities/note-watching.js";
import type { Note } from "@/models/entities/note.js";
import type { User } from "@/models/entities/user.js";
import { NoteWatchings } from "@/models/index.js";

export default async (me: User["id"], note: Note) => {
	// 自分の投稿はwatchできない
	if (me === note.userId) {
		return;
	}

	await NoteWatchings.insert({
		id: genId(),
		createdAt: new Date(),
		noteId: note.id,
		userId: me,
		noteUserId: note.userId,
	} as NoteWatching);
};
