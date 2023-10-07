type Choice = {
    text: string
    votes: number
    isVoted: boolean
}

type Poll = {
    multiple: boolean
    expiresAt: Date | null
    choices: Array<Choice>
}

export class PollConverter {
    public static encode(p: Poll, noteId: string, emojis: MastodonEntity.Emoji[]): MastodonEntity.Poll {
        const now = new Date();
        const count = p.choices.reduce((sum, choice) => sum + choice.votes, 0);
        return {
            id: noteId,
            expires_at: p.expiresAt?.toISOString() ?? null,
            expired: p.expiresAt == null ? false : now > p.expiresAt,
            multiple: p.multiple,
            votes_count: count,
            options: p.choices.map((c) => this.encodeChoice(c)),
            emojis: emojis,
            voted: p.choices.some((c) => c.isVoted),
            own_votes: p.choices
                .filter((c) => c.isVoted)
                .map((c) => p.choices.indexOf(c)),
        };
    }

    private static encodeChoice(c: Choice): MastodonEntity.PollOption {
        return {
            title: c.text,
            votes_count: c.votes,
        };
    }
}
