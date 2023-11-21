import { In, Repository } from "typeorm";
import { Notification } from "@/models/entities/notification.js";
import { awaitAll } from "@/prelude/await-all.js";
import type { Packed } from "@/misc/schema.js";
import type { Note } from "@/models/entities/note.js";
import type { NoteReaction } from "@/models/entities/note-reaction.js";
import type { User } from "@/models/entities/user.js";
import { aggregateNoteEmojis, prefetchEmojis } from "@/misc/populate-emojis.js";
import { notificationTypes } from "@/types.js";
import { db } from "@/db/postgre.js";
import {
	Users,
	Notes,
	UserGroupInvitations,
	AccessTokens,
	NoteReactions,
} from "../index.js";

export const NotificationRepository = db.getRepository(Notification).extend({
	async pack(
		src: Notification["id"] | Notification,
		options: {
			_hintForEachNotes_?: {
				myReactions: Map<Note["id"], NoteReaction | null>;
				myRenotes: Map<Note["id"], boolean>;
			};
		},
	): Promise<Packed<"Notification">> {
		const notification =
			typeof src === "object" ? src : await this.findOneByOrFail({ id: src });
		const token = notification.appAccessTokenId
			? await AccessTokens.findOneByOrFail({
					id: notification.appAccessTokenId,
			  })
			: null;

		return await awaitAll({
			id: notification.id,
			createdAt: notification.createdAt.toISOString(),
			type: notification.type,
			isRead: notification.isRead,
			userId: notification.notifierId,
			user: notification.notifierId
				? Users.pack(notification.notifier || notification.notifierId)
				: null,
			...(notification.type === "mention"
				? {
						note: Notes.pack(
							notification.note || notification.noteId!,
							{ id: notification.notifieeId },
							{
								detail: true,
								_hint_: options._hintForEachNotes_,
							},
						),
				  }
				: {}),
			...(notification.type === "reply"
				? {
						note: Notes.pack(
							notification.note || notification.noteId!,
							{ id: notification.notifieeId },
							{
								detail: true,
								_hint_: options._hintForEachNotes_,
							},
						),
				  }
				: {}),
			...(notification.type === "renote"
				? {
						note: Notes.pack(
							notification.note || notification.noteId!,
							{ id: notification.notifieeId },
							{
								detail: true,
								_hint_: options._hintForEachNotes_,
							},
						),
				  }
				: {}),
			...(notification.type === "quote"
				? {
						note: Notes.pack(
							notification.note || notification.noteId!,
							{ id: notification.notifieeId },
							{
								detail: true,
								_hint_: options._hintForEachNotes_,
							},
						),
				  }
				: {}),
			...(notification.type === "reaction"
				? {
						note: Notes.pack(
							notification.note || notification.noteId!,
							{ id: notification.notifieeId },
							{
								detail: true,
								_hint_: options._hintForEachNotes_,
							},
						),
						reaction: notification.reaction,
				  }
				: {}),
			...(notification.type === "pollVote"
				? {
						note: Notes.pack(
							notification.note || notification.noteId!,
							{ id: notification.notifieeId },
							{
								detail: true,
								_hint_: options._hintForEachNotes_,
							},
						),
						choice: notification.choice,
				  }
				: {}),
			...(notification.type === "pollEnded"
				? {
						note: Notes.pack(
							notification.note || notification.noteId!,
							{ id: notification.notifieeId },
							{
								detail: true,
								_hint_: options._hintForEachNotes_,
							},
						),
				  }
				: {}),
			...(notification.type === "groupInvited"
				? {
						invitation: UserGroupInvitations.pack(
							notification.userGroupInvitationId!,
						),
				  }
				: {}),
			...(notification.type === "app"
				? {
						body: notification.customBody,
						header: notification.customHeader || token?.name,
						icon: notification.customIcon || token?.iconUrl,
				  }
				: {}),
		});
	},

	async packMany(notifications: Notification[], meId: User["id"]) {
		if (notifications.length === 0) return [];

		const notes = notifications
			.filter((x) => x.note != null)
			.map((x) => x.note!);
		const noteIds = notes.map((n) => n.id);
		const myReactionsMap = new Map<Note["id"], NoteReaction | null>();
		const myRenotesMap = new Map<Note["id"], boolean>();
		const renoteIds = notes
			.filter((n) => n.renoteId != null)
			.map((n) => n.renoteId!);
		const targets = [...noteIds, ...renoteIds];
		const myReactions = await NoteReactions.findBy({
			userId: meId,
			noteId: In(targets),
		});
		const myRenotes = targets.length > 0
			? await Notes.createQueryBuilder('note')
				.select('note.renoteId')
				.where('note.userId = :meId', { meId })
				.andWhere('note.renoteId IN (:...targets)', { targets })
				.getMany()
			: [];

		for (const target of targets) {
			myReactionsMap.set(
				target,
				myReactions.find((reaction) => reaction.noteId === target) || null,
			);

			myRenotesMap.set(
				target,
				!!myRenotes.find(p => p.renoteId == target),
			);
		}

		await prefetchEmojis(aggregateNoteEmojis(notes));

		const results = await Promise.all(
			notifications.map((x) =>
				this.pack(x, {
					_hintForEachNotes_: {
						myReactions: myReactionsMap,
						myRenotes: myRenotesMap
					},
				}).catch((e) => null),
			),
		);
		return results.filter((x) => x != null);
	},
});
