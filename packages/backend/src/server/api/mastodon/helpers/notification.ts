import { ILocalUser } from "@/models/entities/user.js";
import { Notes, Notifications } from "@/models/index.js";
import { PaginationHelpers } from "@/server/api/mastodon/helpers/pagination.js";
import { Notification } from "@/models/entities/notification.js";
import {MastoApiError} from "@/server/api/mastodon/middleware/catch-errors.js";

export class NotificationHelpers {
    public static async getNotifications(user: ILocalUser, maxId: string | undefined, sinceId: string | undefined, minId: string | undefined, limit: number = 40, types: string[] | undefined, excludeTypes: string[] | undefined, accountId: string | undefined): Promise<Notification[]> {
        if (limit > 80) limit = 80;
        if (types && excludeTypes) throw new Error("types and exclude_types can not be used simultaneously");

        let requestedTypes = types
            ? this.decodeTypes(types)
            : ['follow', 'mention', 'reply', 'renote', 'quote', 'reaction', 'pollEnded', 'receiveFollowRequest'];

        if (excludeTypes) {
            const excludedTypes = this.decodeTypes(excludeTypes);
            requestedTypes = requestedTypes.filter(p => !excludedTypes.includes(p));
        }

        const query = PaginationHelpers.makePaginationQuery(
            Notifications.createQueryBuilder("notification"),
            sinceId,
            maxId,
            minId
        )
            .andWhere("notification.notifieeId = :userId", {userId: user.id})
            .andWhere("notification.type IN (:...types)", {types: requestedTypes});

        if (accountId !== undefined)
            query.andWhere("notification.notifierId = :notifierId", {notifierId: accountId});

        query.leftJoinAndSelect("notification.note", "note");

        return PaginationHelpers.execQuery(query, limit, minId !== undefined);
    }

    public static async getNotification(id: string, user: ILocalUser): Promise<Notification | null> {
        return Notifications.findOneBy({id: id, notifieeId: user.id});
    }

    public static async getNotificationOr404(id: string, user: ILocalUser): Promise<Notification> {
        return this.getNotification(id, user).then(p => {
           if (p) return p;
           throw new MastoApiError(404);
        });
    }

    public static async dismissNotification(id: string, user: ILocalUser): Promise<void> {
        const result = await Notifications.update({id: id, notifieeId: user.id}, {isRead: true});
    }

    public static async clearAllNotifications(user: ILocalUser): Promise<void> {
        await Notifications.update({notifieeId: user.id}, {isRead: true});
    }

    public static async markConversationAsRead(id: string, user: ILocalUser): Promise<void> {
        const notesQuery = Notes.createQueryBuilder("note")
            .select("note.id")
            .andWhere("COALESCE(note.threadId, note.id) = :conversationId");

        await Notifications.createQueryBuilder("notification")
            .where(`notification."noteId" IN (${notesQuery.getQuery()})`)
            .andWhere(`notification."notifieeId" = :userId`)
            .andWhere(`notification."isRead" = FALSE`)
            .andWhere("notification.type IN (:...types)")
            .setParameter("userId", user.id)
            .setParameter("conversationId", id)
            .setParameter("types", ['reply', 'mention'])
            .update()
            .set({isRead: true})
            .execute();
    }

    private static decodeTypes(types: string[]) {
        const result: string[] = [];
        if (types.includes('follow')) result.push('follow');
        if (types.includes('mention')) result.push('mention', 'reply');
        if (types.includes('reblog')) result.push('renote', 'quote');
        if (types.includes('favourite')) result.push('reaction');
        if (types.includes('poll')) result.push('pollEnded');
        if (types.includes('follow_request')) result.push('receiveFollowRequest');
        return result;
    }
}
