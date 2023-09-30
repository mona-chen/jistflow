import { Users, DriveFiles, Notes } from "@/models/index.js";
import type { DriveFile } from "@/models/entities/drive-file.js";
import type { Note } from "@/models/entities/note.js";
import { MAX_NOTE_TEXT_LENGTH } from "@/const.js";
import { ApiError } from "../../error.js";
import define from "../../define.js";
import { HOUR } from "@/const.js";
// import { deliverQuestionUpdate } from "@/services/note/polls/update.js";
import editNote from "@/services/note/edit.js"
import { Packed } from "@/misc/schema.js";

export const meta = {
	tags: ["notes"],

	requireCredential: true,

	limit: {
		duration: HOUR,
		max: 300,
	},

	kind: "write:notes",

	res: {
		type: "object",
		optional: false,
		nullable: false,
		ref: "Note"
	},

	errors: {
		cannotCreateAlreadyExpiredPoll: {
			message: "Poll is already expired.",
			code: "CANNOT_CREATE_ALREADY_EXPIRED_POLL",
			id: "04da457d-b083-4055-9082-955525eda5a5",
		},

		accountLocked: {
			message: "You migrated. Your account is now locked.",
			code: "ACCOUNT_LOCKED",
			id: "d390d7e1-8a5e-46ed-b625-06271cafd3d3",
		},

		needsEditId: {
			message: "You need to specify `editId`.",
			code: "NEEDS_EDIT_ID",
			id: "d697edc8-8c73-4de8-bded-35fd198b79e5",
		},

		noSuchNote: {
			message: "No such note.",
			code: "NO_SUCH_NOTE",
			id: "eef6c173-3010-4a23-8674-7c4fcaeba719",
		},

		youAreNotTheAuthor: {
			message: "You are not the author of this note.",
			code: "YOU_ARE_NOT_THE_AUTHOR",
			id: "c6e61685-411d-43d0-b90a-a448d2539001",
		},

		notLocalUser: {
			message: "You are not a local user.",
			code: "NOT_LOCAL_USER",
			id: "b907f407-2aa0-4283-800b-a2c56290b822",
		},
	}
} as const;

export const paramDef = {
	type: "object",
	properties: {
		editId: { type: "string", format: "misskey:id" },
		text: { type: "string", maxLength: MAX_NOTE_TEXT_LENGTH, nullable: true },
		cw: { type: "string", nullable: true, maxLength: 250 },
		fileIds: {
			type: "array",
			uniqueItems: true,
			minItems: 1,
			maxItems: 16,
			items: { type: "string", format: "misskey:id" },
		},
		poll: {
			type: "object",
			nullable: true,
			properties: {
				choices: {
					type: "array",
					uniqueItems: true,
					minItems: 2,
					maxItems: 10,
					items: { type: "string", minLength: 1, maxLength: 50 },
				},
				multiple: { type: "boolean", default: false },
				expiresAt: { type: "integer", nullable: true },
				expiredAfter: { type: "integer", nullable: true, minimum: 1 },
			},
			required: ["choices"],
		},
	},
	anyOf: [
		{
			// note with text, files and poll are optional
			properties: {
				text: {
					type: "string",
					minLength: 1,
					maxLength: MAX_NOTE_TEXT_LENGTH,
					nullable: false,
				},
			},
			required: ["text"],
		},
		{
			// note with files, text and poll are optional
			required: ["fileIds"],
		},
		{
			// note with poll, text and files are optional
			properties: {
				poll: { type: "object", nullable: false },
			},
			required: ["poll"],
		},
	],
} as const;

export default define(meta, paramDef, async (ps, user): Promise<Packed<"Note">> => {
	if (user.movedToUri != null) throw new ApiError(meta.errors.accountLocked);

	if (!Users.isLocalUser(user)) {
		throw new ApiError(meta.errors.notLocalUser);
	}

	if (!ps.editId) {
		throw new ApiError(meta.errors.needsEditId);
	}

	let note = await Notes.findOneBy({
		id: ps.editId,
	});

	if (!note) {
		throw new ApiError(meta.errors.noSuchNote);
	}

	if (note.userId !== user.id) {
		throw new ApiError(meta.errors.youAreNotTheAuthor);
	}

	if (ps.poll?.expiresAt && new Date(ps.poll.expiresAt).getTime() < new Date().getTime()) {
		throw new ApiError(meta.errors.cannotCreateAlreadyExpiredPoll);
	}

	let files: DriveFile[] = [];
	const fileIds = ps.fileIds ?? null;
	if (fileIds != null) {
		files = await DriveFiles.createQueryBuilder("file")
			.where("file.userId = :userId AND file.id IN (:...fileIds)", {
				userId: user.id,
				fileIds,
			})
			.orderBy('array_position(ARRAY[:...fileIds], "id"::text)')
			.setParameters({ fileIds })
			.getMany();
	}

	note = await editNote(user, note, {
		text: ps.text,
		cw: ps.cw,
		poll: ps.poll
			? {
				choices: ps.poll.choices,
				multiple: ps.poll.multiple,
				expiresAt: ps.poll.expiresAt ? new Date(ps.poll.expiresAt) : null,
			}
			: undefined,
		files: files
	});

	return Notes.pack(note, user);
});
