import { Notes, NoteThreadMutings, NoteWatchings } from '@/models/index.js';
import { genId } from '@/misc/gen-id.js';
import readNote from '@/services/note/read.js';
import define from '../../../define.js';
import { getNote } from '../../../common/getters.js';
import { ApiError } from '../../../error.js';

export const meta = {
	tags: ["notes"],

	requireCredential: true,

	kind: "write:account",

	errors: {
		noSuchNote: {
			message: "No such note.",
			code: "NO_SUCH_NOTE",
			id: "5ff67ada-ed3b-2e71-8e87-a1a421e177d2",
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		noteId: { type: 'string', format: 'misskey:id' },
		mutingNotificationTypes: {
			description: 'Defines which notification types from the thread should be muted. Replies are always muted. Applies in addition to the global settings, muting takes precedence.',
			type: 'array',
			items: {
				type: 'string',
			},
			uniqueItems: true,
		},
	},
	required: ["noteId"],
} as const;

export default define(meta, paramDef, async (ps, user) => {
	const note = await getNote(ps.noteId, user).catch((err) => {
		if (err.id === "9725d0ce-ba28-4dde-95a7-2cbb2c15de24")
			throw new ApiError(meta.errors.noSuchNote);
		throw err;
	});

	const mutedNotes = await Notes.find({
		where: [
			{
				id: note.threadId || note.id,
			},
			{
				threadId: note.threadId || note.id,
			},
		],
	});

	await readNote(user.id, mutedNotes);

	await NoteThreadMutings.insert({
		id: genId(),
		createdAt: new Date(),
		threadId: note.threadId || note.id,
		userId: user.id,
		mutingNotificationTypes: ps.mutingNotificationTypes,
	});

	// remove all note watchings in the muted thread
	const notesThread = Notes.createQueryBuilder("notes")
		.select("note.id")
		.where({
			threadId: note.threadId ?? note.id,
		});

	await NoteWatchings.createQueryBuilder()
		.delete()
		.where(`"note_watching"."noteId" IN (${ notesThread.getQuery() })`)
		.setParameters(notesThread.getParameters())
		.execute();
});
