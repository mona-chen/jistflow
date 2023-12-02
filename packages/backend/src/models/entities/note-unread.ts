import {
	Column,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	PrimaryColumn,
} from "typeorm";
import { id } from "../id.js";
import type { Channel } from "./channel.js";
import { Note } from "./note.js";
import { User } from "./user.js";

@Entity()
@Index(["userId", "noteId"], { unique: true })
export class NoteUnread {
	@PrimaryColumn(id())
	public id: string;

	@Index()
	@Column(id())
	public userId: User["id"];

	@ManyToOne((type) => User, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public user: User | null;

	@Index()
	@Column(id())
	public noteId: Note["id"];

	@ManyToOne((type) => Note, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public note: Note | null;

	/**
	 * メンションか否か
	 */
	@Index()
	@Column("boolean")
	public isMentioned: boolean;

	/**
	 * ダイレクト投稿か否か
	 */
	@Index()
	@Column("boolean")
	public isSpecified: boolean;

	//#region Denormalized fields
	@Index()
	@Column({
		...id(),
		comment: "[Denormalized]",
	})
	public noteUserId: User["id"];

	@Index()
	@Column({
		...id(),
		nullable: true,
		comment: "[Denormalized]",
	})
	public noteChannelId: Channel["id"] | null;
	//#endregion
}
