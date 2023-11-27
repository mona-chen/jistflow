import { MastodonStream } from "../channel.js";
import { isUserRelated } from "@/misc/is-user-related.js";
import { isInstanceMuted } from "@/misc/is-instance-muted.js";
import { Note } from "@/models/entities/note.js";
import { NoteConverter } from "@/server/api/mastodon/converters/note.js";
import { StreamMessages } from "@/server/api/stream/types.js";
import { fetchMeta } from "@/misc/fetch-meta.js";
import isQuote from "@/misc/is-quote.js";

export class MastodonStreamPublic extends MastodonStream {
    public static shouldShare = true;
    public static requireCredential = false;
    private readonly mediaOnly: boolean;
    private readonly localOnly: boolean;
    private readonly remoteOnly: boolean;
    private readonly allowLocalOnly: boolean;

    constructor(connection: MastodonStream["connection"], name: string) {
        super(connection, name);
        this.mediaOnly = name.endsWith(":media");
        this.localOnly = name.startsWith("public:local");
        this.remoteOnly = name.startsWith("public:remote");
        this.allowLocalOnly = name.startsWith("public:allow_local_only");
        this.onNote = this.onNote.bind(this);
        this.onNoteEvent = this.onNoteEvent.bind(this);
    }

    public async init() {
        const meta = await fetchMeta();
        if (meta.disableGlobalTimeline) {
            if (this.user == null || !(this.user.isAdmin || this.user.isModerator))
                return;
        }

        this.subscriber.on("notesStream", this.onNote);
        this.subscriber.on("noteUpdatesStream", this.onNoteEvent);
    }

    private async onNote(note: Note) {
        if (!await this.shouldProcessNote(note)) return;

        const encoded = await NoteConverter.encodeEvent(note, this.user, 'public')
        this.connection.send(this.chName, "update", encoded);
    }

    private async onNoteEvent(data: StreamMessages["noteUpdates"]["payload"]) {
        const note = data.body;
        if (!await this.shouldProcessNote(note)) return;

        switch (data.type) {
            case "updated":
                const encoded = await NoteConverter.encodeEvent(note, this.user, 'public');
                this.connection.send(this.chName, "status.update", encoded);
                break;
            case "deleted":
                this.connection.send(this.chName, "delete", note.id);
                break;
            default:
                break;
        }
    }

    private async shouldProcessNote(note: Note): Promise<boolean> {
        if (note.visibility !== "public") return false;
        if (note.channelId != null) return false;
        if (this.mediaOnly && note.fileIds.length < 1) return false;
        if (this.localOnly && note.userHost !== null) return false;
        if (this.remoteOnly && note.userHost === null) return false;
        if (note.localOnly && !this.allowLocalOnly && !this.localOnly) return false;
        if (isInstanceMuted(note, new Set<string>(this.userProfile?.mutedInstances ?? []))) return false;
        if (isUserRelated(note, this.muting)) return false;
        if (isUserRelated(note, this.blocking)) return false;
        if (note.renoteId !== null && !isQuote(note) && this.renoteMuting.has(note.userId)) return false;

        return true;
    }

    public dispose() {
        this.subscriber.off("notesStream", this.onNote);
        this.subscriber.off("noteUpdatesStream", this.onNoteEvent);
    }
}
