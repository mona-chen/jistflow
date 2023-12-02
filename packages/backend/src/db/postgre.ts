// https://github.com/typeorm/typeorm/issues/2400
import pg from "pg";
pg.types.setTypeParser(20, Number);

import config from "@/config/index.js";
import * as highlight from "cli-highlight";
import type { Logger } from "typeorm";
import { DataSource } from "typeorm";

import { AbuseUserReport } from "@/models/entities/abuse-user-report.js";
import { AccessToken } from "@/models/entities/access-token.js";
import { Ad } from "@/models/entities/ad.js";
import { AnnouncementRead } from "@/models/entities/announcement-read.js";
import { Announcement } from "@/models/entities/announcement.js";
import { Antenna } from "@/models/entities/antenna.js";
import { App } from "@/models/entities/app.js";
import { AttestationChallenge } from "@/models/entities/attestation-challenge.js";
import { AuthSession } from "@/models/entities/auth-session.js";
import { Blocking } from "@/models/entities/blocking.js";
import { ChannelFollowing } from "@/models/entities/channel-following.js";
import { ChannelNotePining } from "@/models/entities/channel-note-pining.js";
import { Channel } from "@/models/entities/channel.js";
import { ClipNote } from "@/models/entities/clip-note.js";
import { Clip } from "@/models/entities/clip.js";
import { DriveFile } from "@/models/entities/drive-file.js";
import { DriveFolder } from "@/models/entities/drive-folder.js";
import { Emoji } from "@/models/entities/emoji.js";
import { FollowRequest } from "@/models/entities/follow-request.js";
import { Following } from "@/models/entities/following.js";
import { GalleryLike } from "@/models/entities/gallery-like.js";
import { GalleryPost } from "@/models/entities/gallery-post.js";
import { Hashtag } from "@/models/entities/hashtag.js";
import { Instance } from "@/models/entities/instance.js";
import { MessagingMessage } from "@/models/entities/messaging-message.js";
import { Meta } from "@/models/entities/meta.js";
import { ModerationLog } from "@/models/entities/moderation-log.js";
import { MutedNote } from "@/models/entities/muted-note.js";
import { Muting } from "@/models/entities/muting.js";
import { NoteEdit } from "@/models/entities/note-edit.js";
import { NoteFavorite } from "@/models/entities/note-favorite.js";
import { NoteReaction } from "@/models/entities/note-reaction.js";
import { NoteThreadMuting } from "@/models/entities/note-thread-muting.js";
import { NoteUnread } from "@/models/entities/note-unread.js";
import { NoteWatching } from "@/models/entities/note-watching.js";
import { Note } from "@/models/entities/note.js";
import { Notification } from "@/models/entities/notification.js";
import { PageLike } from "@/models/entities/page-like.js";
import { Page } from "@/models/entities/page.js";
import { PasswordResetRequest } from "@/models/entities/password-reset-request.js";
import { PollVote } from "@/models/entities/poll-vote.js";
import { Poll } from "@/models/entities/poll.js";
import { PromoNote } from "@/models/entities/promo-note.js";
import { PromoRead } from "@/models/entities/promo-read.js";
import { RegistrationTicket } from "@/models/entities/registration-tickets.js";
import { RegistryItem } from "@/models/entities/registry-item.js";
import { Relay } from "@/models/entities/relay.js";
import { RenoteMuting } from "@/models/entities/renote-muting.js";
import { Signin } from "@/models/entities/signin.js";
import { SwSubscription } from "@/models/entities/sw-subscription.js";
import { UsedUsername } from "@/models/entities/used-username.js";
import { UserGroupInvitation } from "@/models/entities/user-group-invitation.js";
import { UserGroupJoining } from "@/models/entities/user-group-joining.js";
import { UserGroup } from "@/models/entities/user-group.js";
import { UserIp } from "@/models/entities/user-ip.js";
import { UserKeypair } from "@/models/entities/user-keypair.js";
import { UserListJoining } from "@/models/entities/user-list-joining.js";
import { UserList } from "@/models/entities/user-list.js";
import { UserNotePining } from "@/models/entities/user-note-pining.js";
import { UserPending } from "@/models/entities/user-pending.js";
import { UserProfile } from "@/models/entities/user-profile.js";
import { UserPublickey } from "@/models/entities/user-publickey.js";
import { UserSecurityKey } from "@/models/entities/user-security-key.js";
import { User } from "@/models/entities/user.js";
import { Webhook } from "@/models/entities/webhook.js";

import { entities as charts } from "@/services/chart/entities.js";
import { dbLogger } from "./logger.js";
import { redisClient } from "./redis.js";

// TODO?: should we avoid importing things from built directory?
import { nativeInitDatabase } from "native-utils/built/index.js";

const sqlLogger = dbLogger.createSubLogger("sql", "gray", false);

class MyCustomLogger implements Logger {
	private highlight(sql: string) {
		return highlight.highlight(sql, {
			language: "sql",
			ignoreIllegals: true,
		});
	}

	public logQuery(query: string, parameters?: any[]) {
		sqlLogger.info(this.highlight(query).substring(0, 100));
	}

	public logQueryError(error: string, query: string, parameters?: any[]) {
		sqlLogger.error(this.highlight(query));
	}

	public logQuerySlow(time: number, query: string, parameters?: any[]) {
		sqlLogger.warn(this.highlight(query));
	}

	public logSchemaBuild(message: string) {
		sqlLogger.info(message);
	}

	public log(message: string) {
		sqlLogger.info(message);
	}

	public logMigration(message: string) {
		sqlLogger.info(message);
	}
}

export const entities = [
	Announcement,
	AnnouncementRead,
	Meta,
	Instance,
	App,
	AuthSession,
	AccessToken,
	User,
	UserProfile,
	UserKeypair,
	UserPublickey,
	UserList,
	UserListJoining,
	UserGroup,
	UserGroupJoining,
	UserGroupInvitation,
	UserNotePining,
	UserSecurityKey,
	UsedUsername,
	AttestationChallenge,
	Following,
	FollowRequest,
	Muting,
	RenoteMuting,
	Blocking,
	Note,
	NoteEdit,
	NoteFavorite,
	NoteReaction,
	NoteWatching,
	NoteThreadMuting,
	NoteUnread,
	Page,
	PageLike,
	GalleryPost,
	GalleryLike,
	DriveFile,
	DriveFolder,
	Poll,
	PollVote,
	Notification,
	Emoji,
	Hashtag,
	SwSubscription,
	AbuseUserReport,
	RegistrationTicket,
	MessagingMessage,
	Signin,
	ModerationLog,
	Clip,
	ClipNote,
	Antenna,
	PromoNote,
	PromoRead,
	Relay,
	MutedNote,
	Channel,
	ChannelFollowing,
	ChannelNotePining,
	RegistryItem,
	Ad,
	PasswordResetRequest,
	UserPending,
	Webhook,
	UserIp,
	...charts,
];

const log = process.env.NODE_ENV !== "production";

export const db = new DataSource({
	type: "postgres",
	host: config.db.host,
	port: config.db.port,
	username: config.db.user,
	password: config.db.pass,
	database: config.db.db,
	extra: {
		statement_timeout: 1000 * 10,
		...config.db.extra,
	},
	synchronize: process.env.NODE_ENV === "test",
	dropSchema: process.env.NODE_ENV === "test",
	cache: !config.db.disableCache
		? {
				type: "ioredis",
				options: {
					host: config.redis.host,
					port: config.redis.port,
					family: config.redis.family == null ? 0 : config.redis.family,
					username: config.redis.user ?? "default",
					password: config.redis.pass,
					keyPrefix: `${config.redis.prefix}:query:`,
					db: config.redis.db || 0,
					tls: config.redis.tls,
				},
		  }
		: false,
	logging: log,
	logger: log ? new MyCustomLogger() : undefined,
	maxQueryExecutionTime: 300,
	entities: entities,
	migrations: ["../../migration/*.js"],
});

export async function initDb(force = false) {
	await nativeInitDatabase(
		`postgres://${config.db.user}:${encodeURIComponent(config.db.pass)}@${
			config.db.host
		}:${config.db.port}/${config.db.db}`,
	);
	if (force) {
		if (db.isInitialized) {
			await db.destroy();
		}
		await db.initialize();
		return;
	}

	if (db.isInitialized) {
		// nop
	} else {
		await db.initialize();
	}
}

export async function resetDb() {
	const reset = async () => {
		await redisClient.flushdb();
		const tables = await db.query(`SELECT relname AS "table"
		FROM pg_class C LEFT JOIN pg_namespace N ON (N.oid = C.relnamespace)
		WHERE nspname NOT IN ('pg_catalog', 'information_schema')
			AND C.relkind = 'r'
			AND nspname !~ '^pg_toast';`);
		for (const table of tables) {
			await db.query(`DELETE FROM "${table.table}" CASCADE`);
		}
	};

	for (let i = 1; i <= 3; i++) {
		try {
			await reset();
		} catch (e) {
			if (i === 3) {
				throw e;
			} else {
				await new Promise((resolve) => setTimeout(resolve, 1000));
				continue;
			}
		}
		break;
	}
}
