import { ILocalUser, User } from "@/models/entities/user.js";
import { Notification } from "@/models/entities/notification.js";
import { notificationTypes } from "@/types.js";
import { UserConverter } from "@/server/api/mastodon/converters/user.js";
import { UserHelpers } from "@/server/api/mastodon/helpers/user.js";
import { awaitAll } from "@/prelude/await-all.js";
import { NoteConverter } from "@/server/api/mastodon/converters/note.js";
import { getNote } from "@/server/api/common/getters.js";
import { getStubMastoContext, MastoContext } from "@/server/api/mastodon/index.js";
import { Notifications } from "@/models/index.js";
import isQuote from "@/misc/is-quote.js";
import { unique } from "@/prelude/array.js";
import { Note } from "@/models/entities/note.js";

type NotificationType = typeof notificationTypes[number];

export class NotificationConverter {
    public static async encode(notification: Notification, ctx: MastoContext): Promise<MastodonEntity.Notification> {
        const localUser = ctx.user as ILocalUser;
        if (notification.notifieeId !== localUser.id) throw new Error('User is not recipient of notification');

        const account = notification.notifierId
            ? UserHelpers.getUserCached(notification.notifierId, ctx).then(p => UserConverter.encode(p, ctx))
            : UserConverter.encode(localUser, ctx);

        let result = {
            id: notification.id,
            account: account,
            created_at: notification.createdAt.toISOString(),
            type: this.encodeNotificationType(notification.type),
        };

        const note = notification.note ?? (notification.noteId ? await getNote(notification.noteId, localUser) : null);

        if (note) {
            const isPureRenote = note.renoteId !== null && !isQuote(note);
            const encodedNote = isPureRenote
                ? getNote(note.renoteId!, localUser).then(note => NoteConverter.encode(note, ctx))
                : NoteConverter.encode(note, ctx);
            result = Object.assign(result, {
                status: encodedNote,
            });
            if (result.type === 'poll') {
                result = Object.assign(result, {
                    account: encodedNote.then(p => p.account),
                });
            }
            if (notification.reaction) {
                //FIXME: Implement reactions;
            }
        }
        return awaitAll(result);
    }

    public static async encodeMany(notifications: Notification[], ctx: MastoContext): Promise<MastodonEntity.Notification[]> {
		await this.aggregateData(notifications, ctx);
        const encoded = notifications.map(u => this.encode(u, ctx));
        return Promise.all(encoded)
            .then(p => p.filter(n => n !== null) as MastodonEntity.Notification[]);
    }

	private static async aggregateData(notifications: Notification[], ctx: MastoContext): Promise<void> {
		if (notifications.length === 0) return;
		const notes = unique(notifications.filter(p => p.note != null).map((n) => n.note as Note));
		const users = unique(notifications.filter(p => p.notifier != null).map(n => n.notifier as User)
			.concat(notifications.filter(p => p.notifiee != null).map(n => n.notifiee as User)));
		await NoteConverter.aggregateData(notes, ctx);
		await UserConverter.aggregateData(users, ctx);
	}

    private static encodeNotificationType(t: NotificationType): MastodonEntity.NotificationType {
        //FIXME: Implement custom notification for followRequestAccepted
        //FIXME: Implement mastodon notification type 'update' on misskey side
        switch (t) {
            case "follow":
                return 'follow';
            case "mention":
            case "reply":
                return 'mention'
            case "renote":
                return 'reblog';
            case "quote":
                return 'reblog';
            case "reaction":
                return 'favourite';
            case "pollEnded":
                return 'poll';
            case "receiveFollowRequest":
                return 'follow_request';
            case "followRequestAccepted":
            case "pollVote":
            case "groupInvited":
            case "app":
                throw new Error(`Notification type ${t} not supported`);
        }
    }

    public static async encodeEvent(target: Notification["id"], user: ILocalUser): Promise<MastodonEntity.Notification | null> {
        const ctx = getStubMastoContext(user);
        const notification = await Notifications.findOneByOrFail({ id: target });
        return this.encode(notification, ctx).catch(_ => null);
    }
}
