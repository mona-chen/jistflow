import { convertId, IdType } from "../index.js";

function simpleConvertId(data: any) {
    // copy the object to bypass weird pass by reference bugs
    const result = Object.assign({}, data);
    result.id = convertId(data.id, IdType.MastodonId);
    return result;
}

export function convertAccountId(account: MastodonEntity.Account | MastodonEntity.MutedAccount) {
    return simpleConvertId(account);
}

export function convertAnnouncementId(announcement: MastodonEntity.Announcement) {
    return simpleConvertId(announcement);
}

export function convertAttachmentId(attachment: MastodonEntity.Attachment) {
    return simpleConvertId(attachment);
}

export function convertListId(list: MastodonEntity.List) {
    return simpleConvertId(list);
}

export function convertNotificationIds(notification: MastodonEntity.Notification) {
    notification.account = convertAccountId(notification.account);
    notification.id = convertId(notification.id, IdType.MastodonId);
    if (notification.status)
        notification.status = convertStatusIds(notification.status);
    if (notification.reaction)
        notification.reaction = convertReactionIds(notification.reaction);
    return notification;
}

export function convertPollId(poll: MastodonEntity.Poll) {
    return simpleConvertId(poll);
}

export function convertReactionIds(reaction: MastodonEntity.Reaction) {
    if (reaction.accounts) {
        reaction.accounts = reaction.accounts.map(convertAccountId);
    }
    return reaction;
}

export function convertRelationshipId(relationship: MastodonEntity.Relationship) {
    return simpleConvertId(relationship);
}

export function convertSearchIds(search: MastodonEntity.Search) {
    search.accounts = search.accounts.map(p => convertAccountId(p));
    search.statuses = search.statuses.map(p => convertStatusIds(p));
    return search;
}

export function convertStatusSourceId(statusSource: MastodonEntity.StatusSource) {
    return simpleConvertId(statusSource);
}

export function convertStatusIds(status: MastodonEntity.Status) {
    status.account = convertAccountId(status.account);
    status.id = convertId(status.id, IdType.MastodonId);
    if (status.in_reply_to_account_id)
        status.in_reply_to_account_id = convertId(
            status.in_reply_to_account_id,
            IdType.MastodonId,
        );
    if (status.in_reply_to_id)
        status.in_reply_to_id = convertId(status.in_reply_to_id, IdType.MastodonId);
    status.media_attachments = status.media_attachments.map((attachment) =>
        convertAttachmentId(attachment),
    );
    status.mentions = status.mentions.map((mention) => ({
        ...mention,
        id: convertId(mention.id, IdType.MastodonId),
    }));
    if (status.poll) status.poll = convertPollId(status.poll);
    if (status.reblog) status.reblog = convertStatusIds(status.reblog);
    if (status.quote) status.quote = convertStatusIds(status.quote);
    status.reactions = status.reactions.map(convertReactionIds);

    return status;
}

export function convertStatusEditIds(edit: MastodonEntity.StatusEdit) {
    edit.account = convertAccountId(edit.account);
    edit.media_attachments = edit.media_attachments.map((attachment) =>
        convertAttachmentId(attachment),
    );
    if (edit.poll) edit.poll = convertPollId(edit.poll);
    return edit;
}

export function convertConversationIds(conversation: MastodonEntity.Conversation) {
    conversation.id = convertId(conversation.id, IdType.MastodonId);
    conversation.accounts = conversation.accounts.map(convertAccountId);
    if (conversation.last_status) {
        conversation.last_status = convertStatusIds(conversation.last_status);
    }

    return conversation;
}
