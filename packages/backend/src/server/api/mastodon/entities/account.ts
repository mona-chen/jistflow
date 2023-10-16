/// <reference path="emoji.ts" />
/// <reference path="source.ts" />
/// <reference path="field.ts" />
namespace MastodonEntity {
    export type Account = {
        id: string;
        username: string;
        acct: string;
        fqn: string;
        display_name: string;
        locked: boolean;
        created_at: string;
        followers_count: number;
        following_count: number;
        statuses_count: number;
        note: string;
        url: string;
        avatar: string;
        avatar_static: string;
        header: string;
        header_static: string;
        emojis: Array<Emoji>;
        moved: Account | null;
        fields: Array<Field>;
        bot: boolean | null;
        discoverable: boolean;
        source?: Source;
    };

    export type MutedAccount = Account | {
        mute_expires_at: string | null;
    }

    export type SuggestedAccount = {
        source: "staff" | "past_interactions" | "global",
        account: Account
    }
}
