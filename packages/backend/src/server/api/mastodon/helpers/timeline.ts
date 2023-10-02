import { Note } from "@/models/entities/note.js";
import { ILocalUser } from "@/models/entities/user.js";
import { Followings, Notes, UserListJoinings } from "@/models/index.js";
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

export class TimelineHelpers {
    public static async getHomeTimeline(user: ILocalUser, maxId: string | undefined, sinceId: string | undefined, minId: string | undefined, limit: number = 20): Promise<Note[]> {
        if (limit > 40) limit = 40;

        const followingQuery = Followings.createQueryBuilder("following")
            .select("following.followeeId")
            .where("following.followerId = :followerId", {followerId: user.id});

        const query = PaginationHelpers.makePaginationQuery(
            Notes.createQueryBuilder("note"),
            sinceId,
            maxId,
            minId
        )
            .andWhere(
                new Brackets((qb) => {
                    qb.where(`note.userId IN (${followingQuery.getQuery()} UNION ALL VALUES (:meId))`, {meId: user.id});
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
        query.andWhere("note.visibility != 'specified'");

        return PaginationHelpers.execQuery(query, limit, minId !== undefined);
    }

    public static async getPublicTimeline(user: ILocalUser, maxId: string | undefined, sinceId: string | undefined, minId: string | undefined, limit: number = 20, onlyMedia: boolean = false, local: boolean = false, remote: boolean = false): Promise<Note[]> {
        if (limit > 40) limit = 40;

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

        return PaginationHelpers.execQuery(query, limit, minId !== undefined);
    }

    public static async getListTimeline(user: ILocalUser, list: UserList, maxId: string | undefined, sinceId: string | undefined, minId: string | undefined, limit: number = 20): Promise<Note[]> {
        if (limit > 40) limit = 40;
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
            .setParameters({listId: list.id});

        generateVisibilityQuery(query, user);

        return PaginationHelpers.execQuery(query, limit, minId !== undefined);
    }

    public static async getTagTimeline(user: ILocalUser, tag: string, maxId: string | undefined, sinceId: string | undefined, minId: string | undefined, limit: number = 20, any: string[], all: string[], none: string[], onlyMedia: boolean = false, local: boolean = false, remote: boolean = false): Promise<Note[]> {
        if (limit > 40) limit = 40;

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
            .andWhere("note.tags @> array[:tag]::varchar[]", {tag: tag});

        if (any.length > 0) query.andWhere("note.tags && array[:...any]::varchar[]", {any: any});
        if (all.length > 0) query.andWhere("note.tags @> array[:...all]::varchar[]", {all: all});
        if (none.length > 0) query.andWhere("NOT(note.tags @> array[:...none]::varchar[])", {none: none});

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

        return PaginationHelpers.execQuery(query, limit, minId !== undefined);
    }
}
