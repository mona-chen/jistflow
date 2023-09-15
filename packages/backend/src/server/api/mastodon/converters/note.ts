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

export class NoteConverter {
    public static async encode(note: Note, user: ILocalUser | null): Promise<MastodonEntity.Status> {
        const noteUser = note.user ?? await getUser(note.userId);

				if (!await Notes.isVisibleForMe(note, user?.id ?? null))
					throw new Error('Cannot encode note not visible for user');

				const host = note.user?.host ?? null;

				const reactionEmojiNames = Object.keys(note.reactions)
					.filter((x) => x?.startsWith(":"))
					.map((x) => decodeReaction(x).reaction)
					.map((x) => x.replace(/:/g, ""));

				const noteEmoji = await populateEmojis(
					note.emojis.concat(reactionEmojiNames),
					host,
				);

				const reactionCount = await NoteReactions.countBy({id: note.id});

				const reaction = user ? await NoteReactions.findOneBy({
					userId: user.id,
					noteId: note.id,
				}) : null;

				const isReblogged = user ? await Notes.exist({
					where: {
						userId: user.id,
						renoteId: note.id
					}
				}) : null;

				const reply = note.reply ?? (note.replyId ? await getNote(note.replyId, user) : null);

				const isBookmarked = user ? await NoteFavorites.exist({
					where: {
						userId: user.id,
						noteId: note.id,
					},
					take: 1,
				}) : false;

				const isMuted = user ? await NoteThreadMutings.exist({
					where: {
						userId: user.id,
						threadId: note.threadId || note.id,
					}
				}) : false;

				const files = await DriveFiles.packMany(note.fileIds);

				const mentions = note.mentions.map(async p =>
					await getUser(p)
						.then(u => MentionConverter.encode(u))
						.catch(() => null));

				// FIXME use await-all

        return {
            id: note.id,
            uri: note.uri ? note.uri : `https://${config.host}/notes/${note.id}`,
            url: note.uri ? note.uri : `https://${config.host}/notes/${note.id}`,
            account: await UserConverter.encode(noteUser),
            in_reply_to_id: note.replyId,
            in_reply_to_account_id: reply?.userId ?? null,
            reblog: note.renote ? await this.encode(note.renote, user) : null,
            content: note.text ? toHtml(mfm.parse(note.text), JSON.parse(note.mentionedRemoteUsers)) ?? escapeMFM(note.text) : "",
            text: note.text ? note.text : null,
            created_at: note.createdAt.toISOString(),
            // Remove reaction emojis with names containing @ from the emojis list.
            emojis: noteEmoji
                .filter((e) => e.name.indexOf("@") === -1)
                .map((e) => EmojiConverter.encode(e)),
            replies_count: note.repliesCount,
            reblogs_count: note.renoteCount,
            favourites_count: reactionCount,
            reblogged: isReblogged,
            favourited: !!reaction,
            muted: isMuted,
            sensitive: files.length > 0 ? files.some((f) => f.isSensitive) : false,
            spoiler_text: note.cw ? note.cw : "",
            visibility: VisibilityConverter.encode(note.visibility),
            media_attachments: files.length > 0 ? files.map((f) => FileConverter.encode(f)) : [],
            mentions: (await Promise.all(mentions)).filter(p => p) as MastodonEntity.Mention[],
            tags: [], //FIXME
            card: null, //FIXME
            poll: note.hasPoll ? PollConverter.encode(await populatePoll(note, user?.id ?? null), note.id) : null,
            application: null, //FIXME
            language: null, //FIXME
            pinned: null, //FIXME
            // Use emojis list to provide URLs for emoji reactions.
            reactions: [], //FIXME: this.mapReactions(n.emojis, n.reactions, n.myReaction),
            bookmarked: isBookmarked,
            quote: note.renote && note.text ? await this.encode(note.renote, user) : null,
        };
    }

	public static async encodeMany(notes: Note[], user: ILocalUser | null): Promise<MastodonEntity.Status[]> {
		const encoded = notes.map(n => this.encode(n, user));
		return Promise.all(encoded);
	}
}
