import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { id } from "../id.js";
import { Note } from "./note.js";

@Entity()
export class HtmlNoteCacheEntry {
	@PrimaryColumn(id())
	public noteId: Note["id"];

	@ManyToOne((type) => Note, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public note: Note | null;

	@Column("timestamp with time zone", { nullable: true })
	public updatedAt: Date;

	@Column("text", { nullable: true })
	public content: string | null;
}
