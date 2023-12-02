import {
	Column,
	Entity,
	Index,
	JoinColumn,
	OneToOne,
	PrimaryColumn,
} from "typeorm";
import { id } from "../id.js";
import { Note } from "./note.js";
import type { User } from "./user.js";

@Entity()
export class PromoNote {
	@PrimaryColumn(id())
	public noteId: Note["id"];

	@OneToOne((type) => Note, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public note: Note | null;

	@Column("timestamp with time zone")
	public expiresAt: Date;

	//#region Denormalized fields
	@Index()
	@Column({
		...id(),
		comment: "[Denormalized]",
	})
	public userId: User["id"];
	//#endregion
}
