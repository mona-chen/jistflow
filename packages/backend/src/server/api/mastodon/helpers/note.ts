import { makePaginationQuery } from "@/server/api/common/make-pagination-query.js";
import { DriveFiles, Metas, NoteEdits, NoteFavorites, NoteReactions, Notes, UserNotePinings } from "@/models/index.js";
import { generateVisibilityQuery } from "@/server/api/common/generate-visibility-query.js";
import { generateMutedUserQuery } from "@/server/api/common/generate-muted-user-query.js";
import { generateBlockedUserQuery } from "@/server/api/common/generate-block-query.js";
import { Note } from "@/models/entities/note.js";
import { ILocalUser, User } from "@/models/entities/user.js";
import { getNote } from "@/server/api/common/getters.js";
import createReaction from "@/services/note/reaction/create.js";
import deleteReaction from "@/services/note/reaction/delete.js";
import createNote, { extractMentionedUsers } from "@/services/note/create.js";
import editNote from "@/services/note/edit.js";
import deleteNote from "@/services/note/delete.js";
import { genId } from "@/misc/gen-id.js";
import { PaginationHelpers } from "@/server/api/mastodon/helpers/pagination.js";
import { UserConverter } from "@/server/api/mastodon/converters/user.js";
import { LinkPaginationObject, UserHelpers } from "@/server/api/mastodon/helpers/user.js";
import { addPinned, removePinned } from "@/services/i/pin.js";
import { NoteConverter } from "@/server/api/mastodon/converters/note.js";
import { convertId, IdType } from "@/misc/convert-id.js";
import { awaitAll } from "@/prelude/await-all.js";
import { VisibilityConverter } from "@/server/api/mastodon/converters/visibility.js";
import mfm from "mfm-js";
import { FileConverter } from "@/server/api/mastodon/converters/file.js";
import { MfmHelpers } from "@/server/api/mastodon/helpers/mfm.js";
import { toArray } from "@/prelude/array.js";
import { MastoApiError } from "@/server/api/mastodon/middleware/catch-errors.js";
import { Cache } from "@/misc/cache.js";
import AsyncLock from "async-lock";

export class NoteHelpers {
    public static postIdempotencyCache = new Cache<{ status?: MastodonEntity.Status }>('postIdempotencyCache', 60 * 60);
    public static postIdempotencyLocks = new AsyncLock();

    public static async getDefaultReaction(): Promise<string> {
        return Metas.createQueryBuilder()
            .select('"defaultReaction"')
            .execute()
            .then(p => p[0].defaultReaction)
            .then(p => {
                if (p != null) return p;
                throw new MastoApiError(500, "Failed to get default reaction");
            });
    }

    public static async reactToNote(note: Note, user: ILocalUser, reaction: string): Promise<Note> {
        await createReaction(user, note, reaction);
        return getNote(note.id, user);
    }

    public static async removeReactFromNote(note: Note, user: ILocalUser): Promise<Note> {
        await deleteReaction(user, note);
        return getNote(note.id, user);
    }

    public static async reblogNote(note: Note, user: ILocalUser): Promise<Note> {
        const data = {
            createdAt: new Date(),
            files: [],
            renote: note
        };
        return await createNote(user, data);
    }

    public static async unreblogNote(note: Note, user: ILocalUser): Promise<Note> {
        return Notes.findBy({
            userId: user.id,
            renoteId: note.id,
        })
            .then(p => p.map(n => deleteNote(user, n)))
            .then(p => Promise.all(p))
            .then(_ => getNote(note.id, user));
    }

    public static async bookmarkNote(note: Note, user: ILocalUser): Promise<Note> {
        const bookmarked = await NoteFavorites.exist({
            where: {
                noteId: note.id,
                userId: user.id,
            },
        });

        if (!bookmarked) {
            await NoteFavorites.insert({
                id: genId(),
                createdAt: new Date(),
                noteId: note.id,
                userId: user.id,
            });
        }

        return note;
    }

    public static async unbookmarkNote(note: Note, user: ILocalUser): Promise<Note> {
        return NoteFavorites.findOneBy({
            noteId: note.id,
            userId: user.id,
        })
            .then(p => p !== null ? NoteFavorites.delete(p.id) : null)
            .then(_ => note);
    }

    public static async pinNote(note: Note, user: ILocalUser): Promise<Note> {
        const pinned = await UserNotePinings.exist({
            where: {
                userId: user.id,
                noteId: note.id
            }
        });

        if (!pinned) {
            await addPinned(user, note.id);
        }

        return note;
    }

    public static async unpinNote(note: Note, user: ILocalUser): Promise<Note> {
        const pinned = await UserNotePinings.exist({
            where: {
                userId: user.id,
                noteId: note.id
            }
        });

        if (pinned) {
            await removePinned(user, note.id);
        }

        return note;
    }

    public static async deleteNote(note: Note, user: ILocalUser): Promise<MastodonEntity.Status> {
        if (user.id !== note.userId) throw new MastoApiError(404);
        const status = await NoteConverter.encode(note, user);
        await deleteNote(user, note);
        status.content = undefined;
        return status;
    }

    public static async getNoteFavoritedBy(note: Note, maxId: string | undefined, sinceId: string | undefined, minId: string | undefined, limit: number = 40): Promise<LinkPaginationObject<User[]>> {
        if (limit > 80) limit = 80;
        const query = PaginationHelpers.makePaginationQuery(
            NoteReactions.createQueryBuilder("reaction"),
            sinceId,
            maxId,
            minId
        )
            .andWhere("reaction.noteId = :noteId", {noteId: note.id})
            .innerJoinAndSelect("reaction.user", "user");

        return query.take(limit).getMany().then(async p => {
            if (minId !== undefined) p = p.reverse();
            const users = p
                .map(p => p.user)
                .filter(p => p) as User[];

            return {
                data: users,
                maxId: p.map(p => p.id).at(-1),
                minId: p.map(p => p.id)[0],
            };
        });
    }

    public static async getNoteEditHistory(note: Note): Promise<MastodonEntity.StatusEdit[]> {
        const cache = UserHelpers.getFreshAccountCache();
        const account = Promise.resolve(note.user ?? await UserHelpers.getUserCached(note.userId, cache))
            .then(p => UserConverter.encode(p, cache));
        const edits = await NoteEdits.find({where: {noteId: note.id}, order: {id: "ASC"}});
        const history: Promise<MastodonEntity.StatusEdit>[] = [];

        const curr = {
            id: note.id,
            noteId: note.id,
            note: note,
            text: note.text,
            cw: note.cw,
            fileIds: note.fileIds,
            updatedAt: note.updatedAt ?? note.createdAt
        }

        edits.push(curr);

        let lastDate = note.createdAt;
        for (const edit of edits) {
            const files = DriveFiles.packMany(edit.fileIds);
            const item = {
                account: account,
                content: MfmHelpers.toHtml(mfm.parse(edit.text ?? ''), JSON.parse(note.mentionedRemoteUsers)) ?? '',
                created_at: lastDate.toISOString(),
                emojis: [],
                sensitive: files.then(files => files.length > 0 ? files.some((f) => f.isSensitive) : false),
                spoiler_text: edit.cw ?? '',
                poll: null,
                media_attachments: files.then(files => files.length > 0 ? files.map((f) => FileConverter.encode(f)) : [])
            };
            lastDate = edit.updatedAt;
            history.unshift(awaitAll(item));
        }

        return Promise.all(history);
    }

    public static getNoteSource(note: Note): MastodonEntity.StatusSource {
        return {
            id: note.id,
            text: note.text ?? '',
            spoiler_text: note.cw ?? ''
        }
    }

    public static async getNoteRebloggedBy(note: Note, user: ILocalUser | null, maxId: string | undefined, sinceId: string | undefined, minId: string | undefined, limit: number = 40): Promise<LinkPaginationObject<User[]>> {
        if (limit > 80) limit = 80;
        const query = PaginationHelpers.makePaginationQuery(
            Notes.createQueryBuilder("note"),
            sinceId,
            maxId,
            minId
        )
            .andWhere("note.renoteId = :noteId", {noteId: note.id})
            .andWhere("note.text IS NULL") // We don't want to count quotes as renotes
            .innerJoinAndSelect("note.user", "user");

        generateVisibilityQuery(query, user);

        return query.take(limit).getMany().then(async p => {
            if (minId !== undefined) p = p.reverse();
            const users = p
                .map(p => p.user)
                .filter(p => p) as User[];

            return {
                data: users,
                maxId: p.map(p => p.id).at(-1),
                minId: p.map(p => p.id)[0],
            };
        });
    }

    public static async getNoteDescendants(note: Note | string, user: ILocalUser | null, limit: number = 10, depth: number = 2): Promise<Note[]> {
        const noteId = typeof note === "string" ? note : note.id;
        const query = makePaginationQuery(Notes.createQueryBuilder("note"))
            .andWhere(
                "note.id IN (SELECT id FROM note_replies(:noteId, :depth, :limit))",
                {noteId, depth, limit},
            );

        generateVisibilityQuery(query, user);
        if (user) {
            generateMutedUserQuery(query, user);
            generateBlockedUserQuery(query, user);
        }

        return query.getMany().then(p => p.reverse());
    }

    public static async getNoteAncestors(rootNote: Note, user: ILocalUser | null, limit: number = 10): Promise<Note[]> {
        const notes = new Array<Note>;
        for (let i = 0; i < limit; i++) {
            const currentNote = notes.at(-1) ?? rootNote;
            if (!currentNote.replyId) break;
            const nextNote = await getNote(currentNote.replyId, user).catch((e) => {
                if (e.id === "9725d0ce-ba28-4dde-95a7-2cbb2c15de24") return null;
                throw e;
            });
            if (nextNote && await Notes.isVisibleForMe(nextNote, user?.id ?? null)) notes.push(nextNote);
            else break;
        }

        return notes.reverse();
    }

    public static async createNote(request: MastodonEntity.StatusCreationRequest, user: ILocalUser): Promise<Note> {
        const files = request.media_ids && request.media_ids.length > 0
            ? DriveFiles.findByIds(request.media_ids)
            : [];

        const reply = request.in_reply_to_id ? await getNote(request.in_reply_to_id, user) : undefined;
        const visibility = request.visibility ?? UserHelpers.getDefaultNoteVisibility(user);

        const data = {
            createdAt: new Date(),
            files: files,
            poll: request.poll
                ? {
                    choices: request.poll.options,
                    multiple: request.poll.multiple,
                    expiresAt: request.poll.expires_in && request.poll.expires_in > 0 ? new Date(new Date().getTime() + (request.poll.expires_in * 1000)) : null,
                }
                : undefined,
            text: request.text,
            reply: reply,
            cw: request.spoiler_text,
            visibility: visibility,
            visibleUsers: Promise.resolve(visibility).then(p => p === 'specified' ? this.extractMentions(request.text ?? '', user) : undefined)
        }

        return createNote(user, await awaitAll(data));
    }

    public static async editNote(request: MastodonEntity.StatusEditRequest, note: Note, user: ILocalUser): Promise<Note> {
        const files = request.media_ids && request.media_ids.length > 0
            ? DriveFiles.findByIds(request.media_ids)
            : [];

        const data = {
            files: files,
            poll: request.poll
                ? {
                    choices: request.poll.options,
                    multiple: request.poll.multiple,
                    expiresAt: request.poll.expires_in && request.poll.expires_in > 0 ? new Date(new Date().getTime() + (request.poll.expires_in * 1000)) : null,
                }
                : undefined,
            text: request.text,
            cw: request.spoiler_text
        }

        return editNote(user, note, await awaitAll(data));
    }

    public static async extractMentions(text: string, user: ILocalUser): Promise<User[]> {
        return extractMentionedUsers(user, mfm.parse(text)!);
    }

    public static normalizeComposeOptions(body: any): MastodonEntity.StatusCreationRequest {
        const result: MastodonEntity.StatusCreationRequest = {};

        if (body.status != null && body.status.trim().length > 0)
            result.text = body.status;
        if (body.spoiler_text != null && body.spoiler_text.trim().length > 0)
            result.spoiler_text = body.spoiler_text;
        if (body.visibility != null)
            result.visibility = VisibilityConverter.decode(body.visibility);
        if (body.language != null)
            result.language = body.language;
        if (body.scheduled_at != null)
            result.scheduled_at = new Date(Date.parse(body.scheduled_at));
        if (body.in_reply_to_id)
            result.in_reply_to_id = convertId(body.in_reply_to_id, IdType.IceshrimpId);
        if (body.media_ids)
            result.media_ids = body.media_ids && body.media_ids.length > 0
                ? toArray(body.media_ids)
                    .map(p => convertId(p, IdType.IceshrimpId))
                : undefined;

        if (body.poll) {
            result.poll = {
                expires_in: parseInt(body.poll.expires_in, 10),
                options: body.poll.options,
                multiple: !!body.poll.multiple,
            }
        }

        result.sensitive = !!body.sensitive;

        return result;
    }

    public static normalizeEditOptions(body: any): MastodonEntity.StatusEditRequest {
        const result: MastodonEntity.StatusEditRequest = {};

        if (body.status != null && body.status.trim().length > 0)
            result.text = body.status;
        if (body.spoiler_text != null && body.spoiler_text.trim().length > 0)
            result.spoiler_text = body.spoiler_text;
        if (body.language != null)
            result.language = body.language;
        if (body.media_ids)
            result.media_ids = body.media_ids && body.media_ids.length > 0
                ? toArray(body.media_ids)
                    .map(p => convertId(p, IdType.IceshrimpId))
                : undefined;

        if (body.poll) {
            result.poll = {
                expires_in: parseInt(body.poll.expires_in, 10),
                options: body.poll.options,
                multiple: !!body.poll.multiple,
            }
        }

        result.sensitive = !!body.sensitive;

        return result;
    }

    public static async getNoteOr404(id: string, user: ILocalUser | null): Promise<Note> {
        return getNote(id, user).then(p => {
            if (p === null) throw new MastoApiError(404);
            return p;
        });
    }

    public static getIdempotencyKey(headers: any, user: ILocalUser): string | null {
        if (headers["idempotency-key"] === undefined || headers["idempotency-key"] === null) return null;
        return `${user.id}-${Array.isArray(headers["idempotency-key"]) ? headers["idempotency-key"].at(-1)! : headers["idempotency-key"]}`;
    }

    public static async getFromIdempotencyCache(key: string): Promise<MastodonEntity.Status | undefined> {
        return this.postIdempotencyLocks.acquire(key, async (): Promise<MastodonEntity.Status | undefined> => {
            if (await this.postIdempotencyCache.get(key) !== undefined) {
                let i = 5;
                while ((await this.postIdempotencyCache.get(key))?.status === undefined) {
                    if (++i > 5) throw new Error('Post is duplicate but unable to resolve original');
                    await new Promise((resolve) => {
                        setTimeout(resolve, 500);
                    });
                }

                return (await this.postIdempotencyCache.get(key))?.status;
            } else {
                await this.postIdempotencyCache.set(key, {});
                return undefined;
            }
        });
    }
}
