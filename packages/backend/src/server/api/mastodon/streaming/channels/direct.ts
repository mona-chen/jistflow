import { MastodonStream } from "../channel.js";
import { Note } from "@/models/entities/note.js";
import { NoteConverter } from "@/server/api/mastodon/converters/note.js";
import { StreamMessages } from "@/server/api/stream/types.js";
import { NoteHelpers } from "@/server/api/mastodon/helpers/note.js";
import { Packed } from "@/misc/schema.js";

export class MastodonStreamDirect extends MastodonStream {
    public static shouldShare = true;
    public static requireCredential = true;
    public static requiredScopes = ['read:statuses'];

    constructor(connection: MastodonStream["connection"], name: string) {
        super(connection, name);
        this.onNote = this.onNote.bind(this);
        this.onNoteEvent = this.onNoteEvent.bind(this);
    }

    override get user() {
        return this.connection.user!;
    }

    public async init() {
        this.subscriber.on("notesStream", this.onNote);
        this.subscriber.on("noteUpdatesStream", this.onNoteEvent);
    }

    private async onNote(note: Note) {
        if (!this.shouldProcessNote(note)) return;

        NoteConverter.encodeEvent(note, this.user).then(encoded => {
            this.connection.send(this.chName, "update", encoded);
        });

        NoteHelpers.getConversationFromEvent(note.id, this.user).then(conversation => {
            this.connection.send(this.chName, "conversation", conversation);
        });
    }

    private async onNoteEvent(data: StreamMessages["noteUpdates"]["payload"]) {
        const note = data.body;
        if (!this.shouldProcessNote(note)) return;

        NoteHelpers.getConversationFromEvent(note.id, this.user).then(conversation => {
            this.connection.send(this.chName, "conversation", conversation);
        });

        switch (data.type) {
            case "updated":
                NoteConverter.encodeEvent(note, this.user).then(encoded => {
                    this.connection.send(this.chName, "status.update", encoded);
                });
                break;
            case "deleted":
                this.connection.send(this.chName, "delete", note.id);
                break;
            default:
                break;
        }
    }

    private shouldProcessNote(note: Note | Packed<"Note">): boolean {
        if (note.visibility !== "specified") return false;
        if (note.userId !== this.user.id && !note.visibleUserIds?.includes(this.user.id)) return false;
        return true;
    }

    public dispose() {
        this.subscriber.off("notesStream", this.onNote);
        this.subscriber.off("noteUpdatesStream", this.onNoteEvent);
    }
}
