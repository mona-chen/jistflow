import { ILocalUser } from "@/models/entities/user.js";
import { getNote } from "@/server/api/common/getters.js";
import { Note } from "@/models/entities/note.js";
import config from "@/config/index.js";
import mfm from "mfm-js";
import { UserConverter } from "@/server/api/mastodon/converters/user.js";
import { VisibilityConverter } from "@/server/api/mastodon/converters/visibility.js";
import { escapeMFM } from "@/server/api/mastodon/converters/mfm.js";
import { PopulatedEmoji, populateEmojis } from "@/misc/populate-emojis.js";
import { EmojiConverter } from "@/server/api/mastodon/converters/emoji.js";
import { DriveFiles, NoteFavorites, NoteReactions, Notes, NoteThreadMutings, UserNotePinings } from "@/models/index.js";
import { decodeReaction } from "@/misc/reaction-lib.js";
import { MentionConverter } from "@/server/api/mastodon/converters/mention.js";
import { PollConverter } from "@/server/api/mastodon/converters/poll.js";
import { populatePoll } from "@/models/repositories/note.js";
import { FileConverter } from "@/server/api/mastodon/converters/file.js";
import { awaitAll } from "@/prelude/await-all.js";
import { UserHelpers } from "@/server/api/mastodon/helpers/user.js";
import { IsNull } from "typeorm";
import { MfmHelpers } from "@/server/api/mastodon/helpers/mfm.js";
import { getStubMastoContext, MastoContext } from "@/server/api/mastodon/index.js";
import { NoteHelpers } from "@/server/api/mastodon/helpers/note.js";
import isQuote from "@/misc/is-quote.js";

export class NoteConverter {
    public static async encode(note: Note, ctx: MastoContext, recurse: boolean = true): Promise<MastodonEntity.Status> {
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

        const reactionCount = NoteReactions.countBy({ noteId: note.id });

        const reaction = user ? NoteReactions.findOneBy({
            userId: user.id,
            noteId: note.id,
        }) : null;

        const isFavorited = Promise.resolve(reaction).then(p => !!p);

        const isReblogged = user ? Notes.exist({
            where: {
                userId: user.id,
                renoteId: note.id,
                text: IsNull(),
            }
        }) : null;

        const renote = note.renote ?? (note.renoteId && recurse ? getNote(note.renoteId, user) : null);

        const isBookmarked = user ? NoteFavorites.exist({
            where: {
                userId: user.id,
                noteId: note.id,
            },
            take: 1,
        }) : false;

        const isMuted = user ? NoteThreadMutings.exist({
            where: {
                userId: user.id,
                threadId: note.threadId || note.id,
            }
        }) : false;

        const files = DriveFiles.packMany(note.fileIds);

        const mentions = Promise.all(note.mentions.map(p =>
            UserHelpers.getUserCached(p, ctx)
                .then(u => MentionConverter.encode(u, JSON.parse(note.mentionedRemoteUsers)))
                .catch(() => null)))
            .then(p => p.filter(m => m)) as Promise<MastodonEntity.Mention[]>;

        const quoteUri = Promise.resolve(renote).then(renote => {
            if (!renote || !isQuote(note)) return null;
            return renote.uri ? renote.uri : `${config.url}/notes/${renote.id}`;
        });

        const content = note.text !== null
            ? quoteUri.then(quoteUri => MfmHelpers.toHtml(mfm.parse(note.text!), JSON.parse(note.mentionedRemoteUsers), note.userHost, false, quoteUri)
                .then(p => p ?? escapeMFM(note.text!)))
            : "";

        const isPinned = user && note.userId === user.id
            ? UserNotePinings.exist({ where: { userId: user.id, noteId: note.id } })
            : undefined;

        const tags = note.tags.map(tag => {
            return {
                name: tag,
                url: `${config.url}/tags/${tag}`
            } as MastodonEntity.Tag;
        });

        const reblog = Promise.resolve(renote).then(renote => recurse && renote ? this.encode(renote, ctx, false) : null);

        // noinspection ES6MissingAwait
        return await awaitAll({
            id: note.id,
            uri: note.uri ? note.uri : `https://${config.host}/notes/${note.id}`,
            url: note.uri ? note.uri : `https://${config.host}/notes/${note.id}`,
            account: Promise.resolve(noteUser).then(p => UserConverter.encode(p, ctx)),
            in_reply_to_id: note.replyId,
            in_reply_to_account_id: note.replyUserId,
            reblog: reblog.then(reblog => !isQuote(note) ? reblog : null),
            content: content,
            content_type: 'text/x.misskeymarkdown',
            text: note.text,
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
        const encoded = notes.map(n => this.encode(n, ctx));
        return Promise.all(encoded);
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
