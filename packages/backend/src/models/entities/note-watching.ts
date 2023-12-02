import {
	Column,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	PrimaryColumn,
} from "typeorm";
import { id } from "../id.js";
import { Note } from "./note.js";
import { User } from "./user.js";

@Entity()
@Index(["userId", "noteId"], { unique: true })
export class NoteWatching {
	@PrimaryColumn(id())
	public id: string;

	@Index()
	@Column("timestamp with time zone", {
		comment: "The created date of the NoteWatching.",
	})
	public createdAt: Date;

	@Index()
	@Column({
		...id(),
		comment: "The watcher ID.",
	})
	public userId: User["id"];

	@ManyToOne((type) => User, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public user: User | null;

	@Index()
	@Column({
		...id(),
		comment: "The target Note ID.",
	})
	public noteId: Note["id"];

	@ManyToOne((type) => Note, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public note: Note | null;

	//#region Denormalized fields
	@Index()
	@Column({
		...id(),
		comment: "[Denormalized]",
	})
	public noteUserId: Note["userId"];
	//#endregion
}
