import * as mfm from "mfm-js";
import {
	publishNoteStream, publishNoteUpdatesStream,
} from "@/services/stream.js";
import DeliverManager from "@/remote/activitypub/deliver-manager.js";
import renderNote from "@/remote/activitypub/renderer/note.js";
import { renderActivity } from "@/remote/activitypub/renderer/index.js";
import { extractCustomEmojisFromMfm } from "@/misc/extract-custom-emojis-from-mfm.js";
import { extractHashtags } from "@/misc/extract-hashtags.js";
import type { IMentionedRemoteUsers } from "@/models/entities/note.js";
import { Note } from "@/models/entities/note.js";
import {
	Users,
	Notes,
	UserProfiles,
	Polls,
	NoteEdits,
	PollVotes,
} from "@/models/index.js";
import type { DriveFile } from "@/models/entities/drive-file.js";
import { In } from "typeorm";
import type { ILocalUser, IRemoteUser } from "@/models/entities/user.js";
import { genId } from "@/misc/gen-id.js";
import type { IPoll } from "@/models/entities/poll.js";
import { deliverToRelays } from "../relay.js";
import renderUpdate from "@/remote/activitypub/renderer/update.js";
import { extractMentionedUsers } from "@/services/note/create.js";
import { normalizeForSearch } from "@/misc/normalize-for-search.js";
import { NoteConverter } from "@/server/api/mastodon/converters/note.js";

type Option = {
	text?: string | null;
	files?: DriveFile[] | null;
	poll?: IPoll | null;
	cw?: string | null;
};

export default async function (
	user: ILocalUser,
	note: Note,
	data: Option,
): Promise<Note> {
	if (data.text !== undefined && data.text !== null) {
		data.text = data.text.trim();
	} else {
		data.text = null;
	}

	const fileIds = data.files?.map((file) => file.id) ?? [];
	const fileTypes = data.files?.map((file) => file.type) ?? [];

	const tokens = mfm
		.parse(data.text || "")
		.concat(mfm.parse(data.cw || ""));

	const tags: string[] = extractHashtags(tokens)
		.filter((tag) => Array.from(tag || "").length <= 128)
		.splice(0, 32)
		.map(normalizeForSearch);

	const emojis = extractCustomEmojisFromMfm(tokens);

	const mentionUsers = (await extractMentionedUsers(user, tokens));

	const mentionUserIds = mentionUsers.map((user) => user.id);
	const remoteUsers = mentionUsers.filter((user) => user.host != null);
	const remoteUserIds = remoteUsers.map((user) => user.id);
	const remoteProfiles = await UserProfiles.findBy({
		userId: In(remoteUserIds),
	});
	const mentionedRemoteUsers = remoteUsers.map((user) => {
		const profile = remoteProfiles.find(
			(profile) => profile.userId === user.id,
		);
		return {
			username: user.username,
			host: user.host ?? null,
			uri: user.uri,
			url: profile ? profile.url : undefined,
		} as IMentionedRemoteUsers[0];
	});

	let publishing = false;
	const update = {} as Partial<Note>;
	if (data.text !== null && data.text !== note.text) {
		update.text = data.text;
	}
	if (data.cw !== note.cw) {
		update.cw = data.cw ?? null;
	}
	if (fileIds.sort().join(",") !== note.fileIds.sort().join(",")) {
		update.fileIds = fileIds;
		update.attachedFileTypes = fileTypes;
	}

	if (tags.sort().join(",") !== note.tags.sort().join(",")) {
		update.tags = tags;
	}

	if (mentionUserIds.sort().join(",") !== note.mentions.sort().join(",")) {
		update.mentions = mentionUserIds;
		update.mentionedRemoteUsers = JSON.stringify(mentionedRemoteUsers);
	}

	if (emojis.sort().join(",") !== note.emojis.sort().join(",")) {
		update.emojis = emojis;
	}

	if (note.hasPoll !== !!data.poll) {
		update.hasPoll = !!data.poll;
	}

	if (data.poll) {
		const dbPoll = await Polls.findOneBy({ noteId: note.id });
		if (dbPoll == null) {
			await Polls.insert({
				noteId: note.id,
				choices: data.poll?.choices,
				multiple: data.poll?.multiple,
				votes: data.poll?.votes,
				expiresAt: data.poll?.expiresAt,
				noteVisibility: note.visibility === "hidden" ? "home" : note.visibility,
				userId: user.id,
				userHost: user.host,
			});
			publishing = true;
		} else {
			const choicesChanged = JSON.stringify(dbPoll.choices) !== JSON.stringify(data.poll.choices);

			if (
				dbPoll.multiple !== data.poll.multiple ||
				dbPoll.expiresAt !== data.poll.expiresAt ||
				dbPoll.noteVisibility !== note.visibility ||
				choicesChanged
			) {
				await Polls.update(
					{ noteId: note.id },
					{
						choices: data.poll?.choices,
						multiple: data.poll?.multiple,
						votes: choicesChanged ? new Array(data.poll.choices.length).fill(0) : data.poll?.votes,
						expiresAt: data.poll?.expiresAt,
						noteVisibility:
							note.visibility === "hidden" ? "home" : note.visibility,
					},
				);

				// Reset votes
				if (JSON.stringify(dbPoll.choices) !== JSON.stringify(data.poll.choices)) {
					await PollVotes.delete({ noteId: dbPoll.noteId });
				}

				publishing = true;
			} else {
				for (let i = 0; i < data.poll.choices.length; i++) {
					if (dbPoll.votes[i] !== data.poll.votes?.[i]) {
						await Polls.update({ noteId: note.id }, { votes: data.poll?.votes });
						publishing = true;
						break;
					}
				}
			}
		}
	}

	if (notEmpty(update)) {
		update.updatedAt = new Date();
		await Notes.update(note.id, update);

		// Add previous note contents to NoteEdit history
		await NoteEdits.insert({
			id: genId(),
			noteId: note.id,
			text: note.text || undefined,
			cw: note.cw,
			fileIds: note.fileIds,
			updatedAt: update.updatedAt,
		});

		publishing = true;
	}

	note = await Notes.findOneByOrFail({ id: note.id });

	if (publishing) {
		NoteConverter.prewarmCache(note);

		// Publish update event for the updated note details
		publishNoteStream(note.id, "updated", {
			updatedAt: update.updatedAt,
		});

		publishNoteUpdatesStream("updated", note);

		(async () => {
			const noteActivity = await renderNote(note, false);
			noteActivity.updated = note.updatedAt.toISOString();
			const updateActivity = renderUpdate(noteActivity, user);
			updateActivity.to = noteActivity.to;
			updateActivity.cc = noteActivity.cc;
			const activity = renderActivity(updateActivity);
			const dm = new DeliverManager(user, activity);

			// Delivery to remote mentioned users
			for (const u of mentionUsers.filter((u) => Users.isRemoteUser(u))) {
				dm.addDirectRecipe(u as IRemoteUser);
			}

			// Post is a reply and remote user is the contributor of the original post
			if (note.reply && note.reply.userHost !== null) {
				const u = await Users.findOneBy({ id: note.reply.userId });
				if (u && Users.isRemoteUser(u)) dm.addDirectRecipe(u);
			}

			// Post is a renote and remote user is the contributor of the original post
			if (note.renote && note.renote.userHost !== null) {
				const u = await Users.findOneBy({ id: note.renote.userId });
				if (u && Users.isRemoteUser(u)) dm.addDirectRecipe(u);
			}

			// Deliver to followers for non-direct posts.
			if (["public", "home", "followers"].includes(note.visibility)) {
				dm.addFollowersRecipe();
			}

			// Deliver to relays for public posts.
			if (["public"].includes(note.visibility)) {
				deliverToRelays(user, activity);
			}

			// GO!
			dm.execute();
		})();
	}

	return note;
}

function notEmpty(partial: Partial<any>) {
    return Object.keys(partial).length > 0;
}

