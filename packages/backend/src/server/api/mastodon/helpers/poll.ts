import { Note } from "@/models/entities/note.js";
import { populatePoll } from "@/models/repositories/note.js";
import { PollConverter } from "@/server/api/mastodon/converters/poll.js";
import { ILocalUser, IRemoteUser } from "@/models/entities/user.js";
import { Blockings, Notes, NoteWatchings, Polls, PollVotes, Users } from "@/models/index.js";
import { genId } from "@/misc/gen-id.js";
import { publishNoteStream } from "@/services/stream.js";
import { createNotification } from "@/services/create-notification.js";
import { deliver } from "@/queue/index.js";
import { renderActivity } from "@/remote/activitypub/renderer/index.js";
import renderVote from "@/remote/activitypub/renderer/vote.js";
import { Not } from "typeorm";
import { MastoApiError } from "@/server/api/mastodon/middleware/catch-errors.js";
import { populateEmojis } from "@/misc/populate-emojis.js";
import { EmojiConverter } from "@/server/api/mastodon/converters/emoji.js";
import { UserHelpers } from "@/server/api/mastodon/helpers/user.js";
import { MastoContext } from "@/server/api/mastodon/index.js";

export class PollHelpers {
    public static async getPoll(note: Note, ctx: MastoContext): Promise<MastodonEntity.Poll> {
        const user = ctx.user as ILocalUser | null;
        if (!await Notes.isVisibleForMe(note, user?.id ?? null))
            throw new Error('Cannot encode poll not visible for user');

        const noteUser = note.user ?? UserHelpers.getUserCached(note.userId, ctx);
        const host = Promise.resolve(noteUser).then(noteUser => noteUser.host ?? null);
        const noteEmoji = await host
            .then(async host => populateEmojis(note.emojis, host)
                .then(noteEmoji => noteEmoji
                    .filter((e) => e.name.indexOf("@") === -1)
                    .map((e) => EmojiConverter.encode(e))));

        return populatePoll(note, user?.id ?? null).then(p => PollConverter.encode(p, note.id, noteEmoji));
    }

    public static async voteInPoll(choices: number[], note: Note, ctx: MastoContext): Promise<MastodonEntity.Poll> {
        if (!note.hasPoll) throw new MastoApiError(404);
        const user = ctx.user as ILocalUser;

        for (const choice of choices) {
            const createdAt = new Date();

            if (!note.hasPoll) throw new MastoApiError(404);

            // Check blocking
            if (note.userId !== user.id) {
                const block = await Blockings.findOneBy({
                    blockerId: note.userId,
                    blockeeId: user.id,
                });
                if (block) throw new Error('You are blocked by the poll author');
            }

            const poll = await Polls.findOneByOrFail({ noteId: note.id });

            if (poll.expiresAt && poll.expiresAt < createdAt) throw new Error('Poll is expired');

            if (poll.choices[choice] == null) throw new Error('Invalid choice');

            // if already voted
            const exist = await PollVotes.findBy({
                noteId: note.id,
                userId: user.id,
            });

            if (exist.length) {
                if (poll.multiple) {
                    if (exist.some((x) => x.choice === choice)) throw new Error('You already voted for this option');
                } else {
                    throw new Error('You already voted in this poll');
                }
            }

            // Create vote
            const vote = await PollVotes.insert({
                id: genId(),
                createdAt,
                noteId: note.id,
                userId: user.id,
                choice: choice,
            }).then((x) => PollVotes.findOneByOrFail(x.identifiers[0]));

            // Increment votes count
            const index = choice + 1; // In SQL, array index is 1 based
            await Polls.query(
                `UPDATE poll SET votes[${index}] = votes[${index}] + 1 WHERE "noteId" = '${poll.noteId}'`,
            );

            publishNoteStream(note.id, "pollVoted", {
                choice: choice,
                userId: user.id,
            });

            // Notify
            createNotification(note.userId, "pollVote", {
                notifierId: user.id,
                noteId: note.id,
                choice: choice,
            });

            // Fetch watchers
            NoteWatchings.findBy({
                noteId: note.id,
                userId: Not(user.id),
            }).then((watchers) => {
                for (const watcher of watchers) {
                    createNotification(watcher.userId, "pollVote", {
                        notifierId: user.id,
                        noteId: note.id,
                        choice: choice,
                    });
                }
            });

            // リモート投票の場合リプライ送信
            if (note.userHost != null) {
                const pollOwner = (await Users.findOneByOrFail({
                    id: note.userId,
                })) as IRemoteUser;

                deliver(
                    user,
                    renderActivity(await renderVote(user, vote, note, poll, pollOwner)),
                    pollOwner.inbox,
                );
            }
        }
        return this.getPoll(note, ctx);
    }
}
