import { MastodonStream } from "../channel.js";
import { Note } from "@/models/entities/note.js";
import { NoteConverter } from "@/server/api/mastodon/converters/note.js";
import { StreamMessages } from "@/server/api/stream/types.js";
import { Packed } from "@/misc/schema.js";
import { User } from "@/models/entities/user.js";
import { UserListJoinings } from "@/models/index.js";

export class MastodonStreamList extends MastodonStream {
    public static shouldShare = false;
    public static requireCredential = true;
    public static requiredScopes = ['read:statuses'];
    private readonly listId: string;
    private listUsers: User["id"][] = [];
    private listUsersClock: NodeJS.Timer;

    constructor(connection: MastodonStream["connection"], name: string, list: string) {
        super(connection, name);
        this.listId = list;
        this.onNote = this.onNote.bind(this);
        this.onNoteEvent = this.onNoteEvent.bind(this);
        this.updateListUsers = this.updateListUsers.bind(this);
    }

    override get user() {
        return this.connection.user!;
    }

    public async init() {
        if (!this.listId) return;
        this.subscriber.on("notesStream", this.onNote);
        this.subscriber.on("noteUpdatesStream", this.onNoteEvent);

        this.updateListUsers();
        this.listUsersClock = setInterval(this.updateListUsers, 5000);
    }

    private async updateListUsers() {
        const users = await UserListJoinings.find({
            where: {
                userListId: this.listId,
            },
            select: ["userId"],
        });

        this.listUsers = users.map((x) => x.userId);
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

    private async shouldProcessNote(note: Note | Packed<"Note">): Promise<boolean> {
        if (!this.listUsers.includes(note.userId)) return false;
        if (note.channelId) return false;
        if (note.renoteId !== null && !note.text && this.renoteMuting.has(note.userId)) return false;
        if (note.visibility === "specified") return !!note.visibleUserIds?.includes(this.user.id);
        if (note.visibility === "followers") return this.following.has(note.userId);
        return true;
    }

    public dispose() {
        this.subscriber.off("notesStream", this.onNote);
        this.subscriber.off("noteUpdatesStream", this.onNoteEvent);
        clearInterval(this.listUsersClock);
    }
}
