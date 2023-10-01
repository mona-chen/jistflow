/// <reference path="account.ts" />
/// <reference path="status.ts" />

namespace MastodonEntity {
    export type Notification = {
        account: Account;
        created_at: string;
        id: string;
        status?: Status;
        reaction?: Reaction;
        type: NotificationType;
    };

    export type NotificationType =
        'follow'
        | 'favourite'
        | 'reblog'
        | 'mention'
        | 'reaction'
        | 'follow_request'
        | 'status'
        | 'poll';
}
