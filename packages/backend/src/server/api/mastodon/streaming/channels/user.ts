import { MastodonStream } from "../channel.js";
import { isUserRelated } from "@/misc/is-user-related.js";
import { isInstanceMuted } from "@/misc/is-instance-muted.js";
import { Note } from "@/models/entities/note.js";
import { NoteConverter } from "@/server/api/mastodon/converters/note.js";
import { StreamMessages } from "@/server/api/stream/types.js";
import { NotificationConverter } from "@/server/api/mastodon/converters/notification.js";
import { AnnouncementConverter } from "@/server/api/mastodon/converters/announcement.js";
import isQuote from "@/misc/is-quote.js";

export class MastodonStreamUser extends MastodonStream {
    public static shouldShare = true;
    public static requireCredential = true;
    public static requiredScopes = ['read:statuses', 'read:notifications'];
    private readonly notificationsOnly: boolean;

    constructor(connection: MastodonStream["connection"], name: string) {
        super(connection, name);
        this.notificationsOnly = name === "user:notification";
        this.onNote = this.onNote.bind(this);
        this.onNoteEvent = this.onNoteEvent.bind(this);
        this.onUserEvent = this.onUserEvent.bind(this);
        this.onBroadcastEvent = this.onBroadcastEvent.bind(this);
    }

    override get user() {
        return this.connection.user!;
    }

    public async init() {
        this.subscriber.on(`mainStream:${this.user.id}`, this.onUserEvent);
        if (!this.notificationsOnly) {
            this.subscriber.on("notesStream", this.onNote);
            this.subscriber.on("noteUpdatesStream", this.onNoteEvent);
            this.subscriber.on("broadcast", this.onBroadcastEvent);
        }
    }

    private async onNote(note: Note) {
        if (!await this.shouldProcessNote(note)) return;

        const encoded = await NoteConverter.encodeEvent(note, this.user, 'home')
        this.connection.send(this.chName, "update", encoded);
    }

    private async onNoteEvent(data: StreamMessages["noteUpdates"]["payload"]) {
        const note = data.body;
        if (!await this.shouldProcessNote(note)) return;

        switch (data.type) {
            case "updated":
                const encoded = await NoteConverter.encodeEvent(note, this.user, 'home');
                this.connection.send(this.chName, "status.update", encoded);
                break;
            case "deleted":
                this.connection.send(this.chName, "delete", note.id);
                break;
            default:
                break;
        }
    }

    private async onUserEvent(data: StreamMessages["main"]["payload"]) {
        switch (data.type) {
            case "notification":
                const encoded = await NotificationConverter.encodeEvent(data.body.id, this.user, 'notifications');
                if (encoded) this.connection.send(this.chName, "notification", encoded);
                break;
            default:
                break;
        }
    }

    private async onBroadcastEvent(data: StreamMessages["broadcast"]["payload"]) {
        switch (data.type) {
            case "announcementAdded":
                // This shouldn't be necessary but is for some reason
                data.body.createdAt = new Date(data.body.createdAt);
                this.connection.send(this.chName, "announcement", await AnnouncementConverter.encode(data.body, false));
                break;
            case "announcementDeleted":
                this.connection.send(this.chName, "announcement.delete", data.body);
                break;
            default:
                break;
        }
    }


    private async shouldProcessNote(note: Note): Promise<boolean> {
        if (note.visibility === "hidden") return false;
        if (note.userId === this.user.id) return true;
        if (note.visibility === "specified") return note.visibleUserIds?.includes(this.user.id);
        if (note.channelId) return false;
        if (this.user!.id !== note.userId && !this.following.has(note.userId)) return false;
        if (isInstanceMuted(note, new Set<string>(this.userProfile?.mutedInstances ?? []))) return false;
        if (isUserRelated(note, this.muting)) return false;
        if (isUserRelated(note, this.blocking)) return false;
        if (isUserRelated(note, this.hidden)) return false;
        if (note.renoteId !== null && !isQuote(note) && this.renoteMuting.has(note.userId)) return false;

        return true;
    }

    public dispose() {
        this.subscriber.off(`mainStream:${this.user.id}`, this.onUserEvent);
        if (!this.notificationsOnly) {
            this.subscriber.off("notesStream", this.onNote);
            this.subscriber.off("noteUpdatesStream", this.onNoteEvent);
            this.subscriber.off("broadcast", this.onBroadcastEvent);
        }
    }
}
