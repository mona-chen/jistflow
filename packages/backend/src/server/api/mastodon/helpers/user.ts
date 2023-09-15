import { Note } from "@/models/entities/note.js";
import { ILocalUser } from "@/models/entities/user.js";
import { Followings, Notes } from "@/models/index.js";
import { makePaginationQuery } from "@/server/api/common/make-pagination-query.js";
import { Brackets, SelectQueryBuilder } from "typeorm";
import { generateChannelQuery } from "@/server/api/common/generate-channel-query.js";
import { generateRepliesQuery } from "@/server/api/common/generate-replies-query.js";
import { generateVisibilityQuery } from "@/server/api/common/generate-visibility-query.js";
import { generateMutedUserQuery } from "@/server/api/common/generate-muted-user-query.js";
import { generateMutedNoteQuery } from "@/server/api/common/generate-muted-note-query.js";
import { generateBlockedUserQuery } from "@/server/api/common/generate-block-query.js";
import { generateMutedUserRenotesQueryForNotes } from "@/server/api/common/generated-muted-renote-query.js";
import { fetchMeta } from "@/misc/fetch-meta.js";
import { ApiError } from "@/server/api/error.js";
import { meta } from "@/server/api/endpoints/notes/global-timeline.js";
import { NoteHelpers } from "@/server/api/mastodon/helpers/note.js";

export class UserHelpers {
	public static async getUserStatuses(userId: string, localUser: ILocalUser | null, maxId: string | undefined, sinceId: string | undefined, minId: string | undefined, limit: number = 20, onlyMedia: boolean = false, excludeReplies: boolean = false, excludeReblogs: boolean = false, pinned: boolean = false, tagged: string | undefined): Promise<Note[]> {
		if (limit > 40) limit = 40;

		if (pinned) {
			//FIXME respect pinned
			return [];
		}

		if (tagged !== undefined) {
			//FIXME respect tagged
			return [];
		}

		//FIXME respect minId
		const query = makePaginationQuery(
			Notes.createQueryBuilder("note"),
			sinceId ?? minId,
			maxId,
		)
			.andWhere("note.userId = :userId", { userId });

		if (excludeReblogs) query.andWhere("(note.renoteId IS NOT NULL) OR (note.text IS NOT NULL)");

		query
			.innerJoinAndSelect("note.user", "user")
			.leftJoinAndSelect("user.avatar", "avatar")
			.leftJoinAndSelect("user.banner", "banner")
			.leftJoinAndSelect("note.reply", "reply")
			.leftJoinAndSelect("note.renote", "renote")
			.leftJoinAndSelect("reply.user", "replyUser")
			.leftJoinAndSelect("replyUser.avatar", "replyUserAvatar")
			.leftJoinAndSelect("replyUser.banner", "replyUserBanner")
			.leftJoinAndSelect("renote.user", "renoteUser")
			.leftJoinAndSelect("renoteUser.avatar", "renoteUserAvatar")
			.leftJoinAndSelect("renoteUser.banner", "renoteUserBanner");

		generateRepliesQuery(query, !excludeReplies, localUser);
		generateVisibilityQuery(query, localUser);
		if (localUser) {
			generateMutedUserQuery(query, localUser);
			generateMutedNoteQuery(query, localUser);
			generateBlockedUserQuery(query, localUser);
			generateMutedUserRenotesQueryForNotes(query, localUser);
		}

		if (onlyMedia) query.andWhere("note.fileIds != '{}'");

		query.andWhere("note.visibility != 'hidden'");

		return NoteHelpers.execQuery(query, limit);
	}
}
