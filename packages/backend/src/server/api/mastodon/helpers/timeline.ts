import { Note } from "@/models/entities/note.js";
import { ILocalUser, User } from "@/models/entities/user.js";
import { Followings, Notes, Notifications, UserListJoinings } from "@/models/index.js";
import { Brackets } from "typeorm";
import { generateChannelQuery } from "@/server/api/common/generate-channel-query.js";
import { generateRepliesQuery } from "@/server/api/common/generate-replies-query.js";
import { generateVisibilityQuery } from "@/server/api/common/generate-visibility-query.js";
import { generateMutedUserQuery } from "@/server/api/common/generate-muted-user-query.js";
import { generateMutedNoteQuery } from "@/server/api/common/generate-muted-note-query.js";
import { generateBlockedUserQuery } from "@/server/api/common/generate-block-query.js";
import { generateMutedUserRenotesQueryForNotes } from "@/server/api/common/generated-muted-renote-query.js";
import { fetchMeta } from "@/misc/fetch-meta.js";
import { PaginationHelpers } from "@/server/api/mastodon/helpers/pagination.js";
import { UserList } from "@/models/entities/user-list.js";
import { UserHelpers } from "@/server/api/mastodon/helpers/user.js";
import { UserConverter } from "@/server/api/mastodon/converters/user.js";
import { NoteConverter } from "@/server/api/mastodon/converters/note.js";
import { awaitAll } from "@/prelude/await-all.js";
import { unique } from "@/prelude/array.js";
import { MastoApiError } from "@/server/api/mastodon/middleware/catch-errors.js";
import { generatePaginationData } from "@/server/api/mastodon/middleware/pagination.js";
import { MastoContext } from "@/server/api/mastodon/index.js";

export class TimelineHelpers {
    public static async getHomeTimeline(maxId: string | undefined, sinceId: string | undefined, minId: string | undefined, limit: number = 20, ctx: MastoContext): Promise<Note[]> {
        if (limit > 40) limit = 40;
        const user = ctx.user as ILocalUser;

        const followingQuery = Followings.createQueryBuilder("following")
            .select("following.followeeId")
            .where("following.followerId = :followerId", { followerId: user.id });

        const query = PaginationHelpers.makePaginationQuery(
            Notes.createQueryBuilder("note"),
            sinceId,
            maxId,
            minId
        )
            .andWhere(
                new Brackets((qb) => {
                    qb.where(`note.userId IN (${followingQuery.getQuery()} UNION ALL VALUES (:meId))`, { meId: user.id });
                }),
            )
            .leftJoinAndSelect("note.renote", "renote");

        generateChannelQuery(query, user);
        generateRepliesQuery(query, true, user);
        generateVisibilityQuery(query, user);
        generateMutedUserQuery(query, user);
        generateMutedNoteQuery(query, user);
        generateBlockedUserQuery(query, user);
        generateMutedUserRenotesQueryForNotes(query, user);

        query.andWhere("note.visibility != 'hidden'");

        return PaginationHelpers.execQueryLinkPagination(query, limit, minId !== undefined, ctx);
    }

    public static async getPublicTimeline(maxId: string | undefined, sinceId: string | undefined, minId: string | undefined, limit: number = 20, onlyMedia: boolean = false, local: boolean = false, remote: boolean = false, ctx: MastoContext): Promise<Note[]> {
        if (limit > 40) limit = 40;
        const user = ctx.user as ILocalUser;

        if (local && remote) {
            throw new Error("local and remote are mutually exclusive options");
        }

        if (!local) {
            const m = await fetchMeta();
            if (m.disableGlobalTimeline) {
                if (user == null || !(user.isAdmin || user.isModerator)) {
                    throw new Error("global timeline is disabled");
                }
            }
        }

        const query = PaginationHelpers.makePaginationQuery(
            Notes.createQueryBuilder("note"),
            sinceId,
            maxId,
            minId
        )
            .andWhere("note.visibility = 'public'");

        if (remote) query.andWhere("note.userHost IS NOT NULL");
        if (local) query.andWhere("note.userHost IS NULL");
        if (!local) query.andWhere("note.channelId IS NULL");

        query.leftJoinAndSelect("note.renote", "renote");

        generateRepliesQuery(query, true, user);
        if (user) {
            generateMutedUserQuery(query, user);
            generateMutedNoteQuery(query, user);
            generateBlockedUserQuery(query, user);
            generateMutedUserRenotesQueryForNotes(query, user);
        }

        if (onlyMedia) query.andWhere("note.fileIds != '{}'");

        return PaginationHelpers.execQueryLinkPagination(query, limit, minId !== undefined, ctx);
    }

    public static async getListTimeline(list: UserList, maxId: string | undefined, sinceId: string | undefined, minId: string | undefined, limit: number = 20, ctx: MastoContext): Promise<Note[]> {
        if (limit > 40) limit = 40;
        const user = ctx.user as ILocalUser;
        if (user.id != list.userId) throw new Error("List is not owned by user");

        const listQuery = UserListJoinings.createQueryBuilder("member")
            .select("member.userId", 'userId')
            .where("member.userListId = :listId");

        const query = PaginationHelpers.makePaginationQuery(
            Notes.createQueryBuilder("note"),
            sinceId,
            maxId,
            minId
        )
            .andWhere(`note.userId IN (${listQuery.getQuery()})`)
            .andWhere("note.visibility != 'specified'")
            .leftJoinAndSelect("note.renote", "renote")
            .setParameters({ listId: list.id });

        generateVisibilityQuery(query, user);

        return PaginationHelpers.execQueryLinkPagination(query, limit, minId !== undefined, ctx);
    }

    public static async getTagTimeline(tag: string, maxId: string | undefined, sinceId: string | undefined, minId: string | undefined, limit: number = 20, any: string[], all: string[], none: string[], onlyMedia: boolean = false, local: boolean = false, remote: boolean = false, ctx: MastoContext): Promise<Note[]> {
        if (limit > 40) limit = 40;
        const user = ctx.user as ILocalUser | null;

        if (tag.length < 1) throw new MastoApiError(400, "Tag cannot be empty");

        if (local && remote) {
            throw new Error("local and remote are mutually exclusive options");
        }

        const query = PaginationHelpers.makePaginationQuery(
            Notes.createQueryBuilder("note"),
            sinceId,
            maxId,
            minId
        )
            .andWhere("note.visibility = 'public'")
            .andWhere("note.tags @> array[:tag]::varchar[]", { tag: tag });

        if (any.length > 0) query.andWhere("note.tags && array[:...any]::varchar[]", { any: any });
        if (all.length > 0) query.andWhere("note.tags @> array[:...all]::varchar[]", { all: all });
        if (none.length > 0) query.andWhere("NOT(note.tags @> array[:...none]::varchar[])", { none: none });

        if (remote) query.andWhere("note.userHost IS NOT NULL");
        if (local) query.andWhere("note.userHost IS NULL");
        if (!local) query.andWhere("note.channelId IS NULL");

        query.leftJoinAndSelect("note.renote", "renote");

        generateRepliesQuery(query, true, user);
        if (user) {
            generateMutedUserQuery(query, user);
            generateMutedNoteQuery(query, user);
            generateBlockedUserQuery(query, user);
            generateMutedUserRenotesQueryForNotes(query, user);
        }

        if (onlyMedia) query.andWhere("note.fileIds != '{}'");

        return PaginationHelpers.execQueryLinkPagination(query, limit, minId !== undefined, ctx);
    }

    public static async getConversations(maxId: string | undefined, sinceId: string | undefined, minId: string | undefined, limit: number = 20, ctx: MastoContext): Promise<MastodonEntity.Conversation[]> {
        if (limit > 40) limit = 40;
        const user = ctx.user as ILocalUser;
        const sq = Notes.createQueryBuilder("note")
            .select("COALESCE(note.threadId, note.id)", "conversationId")
            .addSelect("note.id", "latest")
            .distinctOn(["COALESCE(note.threadId, note.id)"])
            .orderBy({ "COALESCE(note.threadId, note.id)": minId ? "ASC" : "DESC", "note.id": "DESC" })
            .andWhere("note.visibility = 'specified'")
            .andWhere(
                new Brackets(qb => {
                    qb.where("note.userId = :userId");
                    qb.orWhere("note.visibleUserIds @> array[:userId]::varchar[]");
                }));

        const query = PaginationHelpers.makePaginationQuery(
            Notes.createQueryBuilder("note"),
            sinceId,
            maxId,
            minId
        )
            .innerJoin(`(${sq.getQuery()})`, "sq", "note.id = sq.latest")
            .setParameters({ userId: user.id })

        return query.take(limit).getMany().then(p => {
            if (minId !== undefined) p = p.reverse();
            const conversations = p.map(c => {
                // Gather all unique IDs except for the local user
                const userIds = unique([c.userId].concat(c.visibleUserIds).filter(p => p != user.id));
                const users = userIds.map(id => UserHelpers.getUserCached(id, ctx).catch(_ => null));
                const accounts = Promise.all(users).then(u => UserConverter.encodeMany(u.filter(u => u) as User[], ctx));
                const unread = Notifications.createQueryBuilder('notification')
                    .where("notification.noteId = :noteId")
                    .andWhere("notification.notifieeId = :userId")
                    .andWhere("notification.isRead = FALSE")
                    .andWhere("notification.type IN (:...types)")
                    .setParameter("noteId", c.id)
                    .setParameter("userId", user.id)
                    .setParameter("types", ['reply', 'mention'])
                    .getExists();

                return {
                    id: c.threadId ?? c.id,
                    accounts: accounts.then(u => u.length > 0 ? u : UserConverter.encodeMany([user], ctx)), // failsafe to prevent apps from crashing case when all participant users have been deleted
                    last_status: NoteConverter.encode(c, ctx),
                    unread: unread
                }
            });

            ctx.pagination = generatePaginationData(p.map(p => p.threadId ?? p.id), limit);
            return Promise.all(conversations.map(c => awaitAll(c)));
        });
    }
}
