import { ILocalUser } from "@/models/entities/user.js";
import {getNote, getUser} from "@/server/api/common/getters.js";
import { Note } from "@/models/entities/note.js";
import config from "@/config/index.js";
import mfm from "mfm-js";
import { toHtml } from "@/mfm/to-html.js";
import { UserConverter } from "@/server/api/mastodon/converters/user.js";
import { VisibilityConverter } from "@/server/api/mastodon/converters/visibility.js";
import { escapeMFM } from "@/server/api/mastodon/converters/mfm.js";
import { populateEmojis } from "@/misc/populate-emojis.js";
import { EmojiConverter } from "@/server/api/mastodon/converters/emoji.js";
import { DriveFiles, NoteFavorites, NoteReactions, Notes, NoteThreadMutings } from "@/models/index.js";
import { decodeReaction } from "@/misc/reaction-lib.js";
import { MentionConverter } from "@/server/api/mastodon/converters/mention.js";
import { PollConverter } from "@/server/api/mastodon/converters/poll.js";
import { populatePoll } from "@/models/repositories/note.js";
import { FileConverter } from "@/server/api/mastodon/converters/file.js";
import { awaitAll } from "@/prelude/await-all.js";
import { AccountCache, UserHelpers } from "@/server/api/mastodon/helpers/user.js";

export class NoteConverter {
    public static async encode(note: Note, user: ILocalUser | null, cache: AccountCache = UserHelpers.getFreshAccountCache()): Promise<MastodonEntity.Status> {
        const noteUser = note.user ?? UserHelpers.getUserCached(note.userId, cache);

				if (!await Notes.isVisibleForMe(note, user?.id ?? null))
					throw new Error('Cannot encode note not visible for user');

				const host = Promise.resolve(noteUser).then(noteUser => noteUser.host ?? null);

				const reactionEmojiNames = Object.keys(note.reactions)
					.filter((x) => x?.startsWith(":"))
					.map((x) => decodeReaction(x).reaction)
					.map((x) => x.replace(/:/g, ""));

				const noteEmoji = Promise.resolve(host).then(async host => populateEmojis(
					note.emojis.concat(reactionEmojiNames),
					host,
				));

				const reactionCount = NoteReactions.countBy({noteId: note.id});

				const reaction = user ? NoteReactions.findOneBy({
					userId: user.id,
					noteId: note.id,
				}) : null;

				const isFavorited = Promise.resolve(reaction).then(p => !!p);

				const isReblogged = user ? Notes.exist({
					where: {
						userId: user.id,
						renoteId: note.id
					}
				}) : null;

				const reply = note.reply ?? (note.replyId ? getNote(note.replyId, user) : null);
				const renote = note.renote ?? (note.renoteId ? getNote(note.renoteId, user) : null);

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
					UserHelpers.getUserCached(p, cache)
						.then(u => MentionConverter.encode(u, JSON.parse(note.mentionedRemoteUsers)))
						.catch(() => null)))
					.then(p => p.filter(m => m)) as Promise<MastodonEntity.Mention[]>;

				const text = Promise.resolve(renote).then(renote => {
					return renote && note.text !== null
						? note.text + `\n\nRE: ${renote.uri ? renote.uri : `${config.url}/notes/${renote.id}`}`
						: note.text;
				});

        // noinspection ES6MissingAwait
				return await awaitAll({
            id: note.id,
            uri: note.uri ? note.uri : `https://${config.host}/notes/${note.id}`,
            url: note.uri ? note.uri : `https://${config.host}/notes/${note.id}`,
            account: Promise.resolve(noteUser).then(p => UserConverter.encode(p, cache)),
            in_reply_to_id: note.replyId,
            in_reply_to_account_id: Promise.resolve(reply).then(reply => reply?.userId ?? null),
            reblog: Promise.resolve(renote).then(renote => renote && note.text === null ? this.encode(renote, user, cache) : null),
            content: Promise.resolve(text).then(text => text !== null ? toHtml(mfm.parse(text), JSON.parse(note.mentionedRemoteUsers)) ?? escapeMFM(text) : ""),
            text: text,
            created_at: note.createdAt.toISOString(),
            // Remove reaction emojis with names containing @ from the emojis list.
            emojis: noteEmoji
							.then(noteEmoji => noteEmoji
                .filter((e) => e.name.indexOf("@") === -1)
                .map((e) => EmojiConverter.encode(e))),
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
            tags: [], //FIXME
            card: null, //FIXME
            poll: note.hasPoll ? populatePoll(note, user?.id ?? null).then(p => PollConverter.encode(p, note.id)) : null,
            application: null, //FIXME
            language: null, //FIXME
            pinned: null, //FIXME
            // Use emojis list to provide URLs for emoji reactions.
            reactions: [], //FIXME: this.mapReactions(n.emojis, n.reactions, n.myReaction),
            bookmarked: isBookmarked,
            quote: Promise.resolve(renote).then(renote => renote && note.text !== null ? this.encode(renote, user, cache) : null),
        });
    }

	public static async encodeMany(notes: Note[], user: ILocalUser | null, cache: AccountCache = UserHelpers.getFreshAccountCache()): Promise<MastodonEntity.Status[]> {
		const encoded = notes.map(n => this.encode(n, user, cache));
		return Promise.all(encoded);
	}
}
