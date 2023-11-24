import { ILocalUser, User } from "@/models/entities/user.js";
import { getNote } from "@/server/api/common/getters.js";
import { Note } from "@/models/entities/note.js";
import config from "@/config/index.js";
import mfm from "mfm-js";
import { UserConverter } from "@/server/api/mastodon/converters/user.js";
import { VisibilityConverter } from "@/server/api/mastodon/converters/visibility.js";
import { escapeMFM } from "@/server/api/mastodon/converters/mfm.js";
import { aggregateNoteEmojis, PopulatedEmoji, populateEmojis, prefetchEmojis } from "@/misc/populate-emojis.js";
import { EmojiConverter } from "@/server/api/mastodon/converters/emoji.js";
import { DriveFiles, NoteFavorites, NoteReactions, Notes, NoteThreadMutings, UserNotePinings } from "@/models/index.js";
import { decodeReaction } from "@/misc/reaction-lib.js";
import { MentionConverter } from "@/server/api/mastodon/converters/mention.js";
import { PollConverter } from "@/server/api/mastodon/converters/poll.js";
import { populatePoll } from "@/models/repositories/note.js";
import { FileConverter } from "@/server/api/mastodon/converters/file.js";
import { awaitAll } from "@/prelude/await-all.js";
import { UserHelpers } from "@/server/api/mastodon/helpers/user.js";
import { In, IsNull } from "typeorm";
import { MfmHelpers } from "@/server/api/mastodon/helpers/mfm.js";
import { getStubMastoContext, MastoContext } from "@/server/api/mastodon/index.js";
import { NoteHelpers } from "@/server/api/mastodon/helpers/note.js";
import isQuote from "@/misc/is-quote.js";
import { unique } from "@/prelude/array.js";
import { NoteReaction } from "@/models/entities/note-reaction.js";

export class NoteConverter {
    public static async encode(note: Note, ctx: MastoContext, recurseCounter: number = 2): Promise<MastodonEntity.Status> {
        const user = ctx.user as ILocalUser | null;
        const noteUser = note.user ?? UserHelpers.getUserCached(note.userId, ctx);

        if (!await Notes.isVisibleForMe(note, user?.id ?? null))
            throw new Error('Cannot encode note not visible for user');

        const host = Promise.resolve(noteUser).then(noteUser => noteUser.host ?? null);

        const reactionEmojiNames = Object.keys(note.reactions)
            .filter((x) => x?.startsWith(":"))
            .map((x) => decodeReaction(x).reaction)
            .map((x) => x.replace(/:/g, ""));

        const populated = host.then(async host => populateEmojis(
            note.emojis.concat(reactionEmojiNames),
            host,
        ));

        const noteEmoji = populated.then(noteEmoji => noteEmoji
            .filter((e) => e.name.indexOf("@") === -1)
            .map((e) => EmojiConverter.encode(e)));

        const reactionCount = Object.values(note.reactions).reduce((a, b) => a + b, 0);

        const aggregateReaction = (ctx.reactionAggregate as Map<string, NoteReaction | null>)?.get(note.id);

        const reaction = aggregateReaction !== undefined
            ? aggregateReaction
            : user ? NoteReactions.findOneBy({
                userId: user.id,
                noteId: note.id,
            }) : null;

        const isFavorited = Promise.resolve(reaction).then(p => !!p);

        const isReblogged = (ctx.renoteAggregate as Map<string, boolean>)?.get(note.id)
            ?? (user ? Notes.exist({
                where: {
                    userId: user.id,
                    renoteId: note.id,
                    text: IsNull(),
                }
            }) : null);

        const renote = note.renote ?? (note.renoteId && recurseCounter > 0 ? getNote(note.renoteId, user) : null);

        const isBookmarked = (ctx.bookmarkAggregate as Map<string, boolean>)?.get(note.id)
            ?? (user ? NoteFavorites.exist({
                where: {
                    userId: user.id,
                    noteId: note.id,
                },
                take: 1,
            }) : false);

        const isMuted = (ctx.mutingAggregate as Map<string, boolean>)?.get(note.threadId ?? note.id)
            ?? (user ? NoteThreadMutings.exist({
                where: {
                    userId: user.id,
                    threadId: note.threadId || note.id,
                }
            }) : false);

        const files = DriveFiles.packMany(note.fileIds);

        const mentions = Promise.all(note.mentions.map(p =>
            UserHelpers.getUserCached(p, ctx)
                .then(u => MentionConverter.encode(u, JSON.parse(note.mentionedRemoteUsers)))
                .catch(() => null)))
            .then(p => p.filter(m => m)) as Promise<MastodonEntity.Mention[]>;

        const quoteUri = Promise.resolve(renote).then(renote => {
            if (!renote || !isQuote(note)) return null;
            return renote.url ?? renote.uri ?? `${config.url}/notes/${renote.id}`;
        });

        const text = quoteUri.then(quoteUri => note.text !== null ? quoteUri !== null ? note.text.replaceAll(`RE: ${quoteUri}`, '').replaceAll(quoteUri, '').trimEnd() : note.text : null);

        const content = text.then(text => text !== null
            ? quoteUri.then(quoteUri => MfmHelpers.toHtml(mfm.parse(text), JSON.parse(note.mentionedRemoteUsers), note.userHost, false, quoteUri))
                .then(p => p ?? escapeMFM(text))
            : "");

        const isPinned = (ctx.pinAggregate as Map<string, boolean>)?.get(note.id)
            ?? (user && note.userId === user.id
                ? UserNotePinings.exist({ where: { userId: user.id, noteId: note.id } })
                : undefined);

        const tags = note.tags.map(tag => {
            return {
                name: tag,
                url: `${config.url}/tags/${tag}`
            } as MastodonEntity.Tag;
        });

        const reblog = Promise.resolve(renote).then(renote => recurseCounter > 0 && renote ? this.encode(renote, ctx, isQuote(renote) && !isQuote(note) ? --recurseCounter : 0) : null);

        // noinspection ES6MissingAwait
        return await awaitAll({
            id: note.id,
            uri: note.uri ?? `https://${config.host}/notes/${note.id}`,
            url: note.url ?? note.uri ?? `https://${config.host}/notes/${note.id}`,
            account: Promise.resolve(noteUser).then(p => UserConverter.encode(p, ctx)),
            in_reply_to_id: note.replyId,
            in_reply_to_account_id: note.replyUserId,
            reblog: reblog.then(reblog => !isQuote(note) ? reblog : null),
            content: content,
            content_type: 'text/x.misskeymarkdown',
            text: text,
            created_at: note.createdAt.toISOString(),
            emojis: noteEmoji,
            replies_count: note.repliesCount,
            reblogs_count: note.renoteCount,
            favourites_count: reactionCount,
            reblogged: isReblogged,
            favourited: isFavorited,
            muted: isMuted,
            sensitive: files.then(files => files.length > 0 ? files.some((f) => f.isSensitive) : false),
            spoiler_text: note.cw ? note.cw : "",
            visibility: VisibilityConverter.encode(note.visibility),
            media_attachments: files.then(files => files.length > 0 ? files.map((f) => FileConverter.encode(f)) : []),
            mentions: mentions,
            tags: tags,
            card: null, //FIXME
            poll: note.hasPoll ? populatePoll(note, user?.id ?? null).then(p => noteEmoji.then(emojis => PollConverter.encode(p, note.id, emojis))) : null,
            application: null, //FIXME
            language: null, //FIXME
            pinned: isPinned,
            reactions: populated.then(populated => Promise.resolve(reaction).then(reaction => this.encodeReactions(note.reactions, reaction?.reaction, populated))),
            bookmarked: isBookmarked,
            quote: reblog.then(reblog => isQuote(note) ? reblog : null),
            edited_at: note.updatedAt?.toISOString()
        });
    }

    public static async encodeMany(notes: Note[], ctx: MastoContext): Promise<MastodonEntity.Status[]> {
        await this.aggregateData(notes, ctx);
        const encoded = notes.map(n => this.encode(n, ctx));
        return Promise.all(encoded);
    }

    private static async aggregateData(notes: Note[], ctx: MastoContext): Promise<void> {
        if (notes.length === 0) return;

        const user = ctx.user as ILocalUser | null;
        const reactionAggregate = new Map<Note["id"], NoteReaction | null>();
        const renoteAggregate = new Map<Note["id"], boolean>();
        const mutingAggregate = new Map<Note["id"], boolean>();
        const bookmarkAggregate = new Map<Note["id"], boolean>();;
        const pinAggregate = new Map<Note["id"], boolean>();

        if (user?.id != null) {
            const renoteIds = notes
                .filter((n) => n.renoteId != null)
                .map((n) => n.renoteId!);

            const noteIds = unique(notes.map((n) => n.id));
            const targets = unique([...noteIds, ...renoteIds]);
            const mutingTargets = unique([...notes.map(n => n.threadId ?? n.id)]);
            const pinTargets = unique([...notes.filter(n => n.userId === user.id).map(n => n.id)]);

            const reactions = await NoteReactions.findBy({
                userId: user.id,
                noteId: In(targets),
            });

            const renotes = await Notes.createQueryBuilder('note')
                .select('note.renoteId')
                .where('note.userId = :meId', { meId: user.id })
                .andWhere('note.renoteId IN (:...targets)', { targets })
                .andWhere('note.text IS NULL')
                .andWhere('note.hasPoll = FALSE')
                .andWhere(`note.fileIds = '{}'`)
                .getMany();

            const mutings = await NoteThreadMutings.createQueryBuilder('muting')
                .select('muting.threadId')
                .where('muting.userId = :meId', { meId: user.id })
                .andWhere('muting.threadId IN (:...targets)', { targets: mutingTargets })
                .getMany();

            const bookmarks = await NoteFavorites.createQueryBuilder('bookmark')
                .select('bookmark.noteId')
                .where('bookmark.userId = :meId', { meId: user.id })
                .andWhere('bookmark.noteId IN (:...targets)', { targets })
                .getMany();

            const pins = pinTargets.length > 0 ? await UserNotePinings.createQueryBuilder('pin')
                .select('pin.noteId')
                .where('pin.userId = :meId', { meId: user.id })
                .andWhere('pin.noteId IN (:...targets)', { targets: pinTargets })
                .getMany() : [];

            for (const target of targets) {
                reactionAggregate.set(target, reactions.find(r => r.noteId === target) ?? null);
                renoteAggregate.set(target, !!renotes.find(n => n.renoteId === target));
                bookmarkAggregate.set(target, !!bookmarks.find(b => b.noteId === target));
            }

            for (const target of mutingTargets) {
                mutingAggregate.set(target, !!mutings.find(m => m.threadId === target));
            }

            for (const target of pinTargets) {
                mutingAggregate.set(target, !!pins.find(m => m.noteId === target));
            }
        }

        ctx.reactionAggregate = reactionAggregate;
        ctx.renoteAggregate = renoteAggregate;
        ctx.mutingAggregate = mutingAggregate;
        ctx.bookmarkAggregate = bookmarkAggregate;
        ctx.pinAggregate = pinAggregate;

        const users = notes.filter(p => !!p.user).map(p => p.user as User);
        await UserConverter.aggregateData([...users], ctx)
        await prefetchEmojis(aggregateNoteEmojis(notes));
    }

    private static encodeReactions(reactions: Record<string, number>, myReaction: string | undefined, populated: PopulatedEmoji[]): MastodonEntity.Reaction[] {
        return Object.keys(reactions).map(key => {

            const isCustom = key.startsWith(':') && key.endsWith(':');
            const name = isCustom ? key.substring(1, key.length - 1) : key;
            const populatedName = isCustom && name.indexOf('@') === -1 ? `${name}@.` : name;
            const url = isCustom ? populated.find(p => p.name === populatedName)?.url : undefined;

            return {
                count: reactions[key],
                me: key === myReaction,
                name: name,
                url: url,
                static_url: url,
            };
        }).filter(r => r.count > 0);
    }

    public static async encodeEvent(note: Note, user: ILocalUser | undefined): Promise<MastodonEntity.Status> {
        const ctx = getStubMastoContext(user);
        NoteHelpers.fixupEventNote(note);
        return NoteConverter.encode(note, ctx);
    }
}
