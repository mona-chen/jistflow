import {
	Column,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	PrimaryColumn,
} from "typeorm";
import { id } from "../id.js";
import { Channel } from "./channel.js";
import { Note } from "./note.js";

@Entity()
@Index(["channelId", "noteId"], { unique: true })
export class ChannelNotePining {
	@PrimaryColumn(id())
	public id: string;

	@Column("timestamp with time zone", {
		comment: "The created date of the ChannelNotePining.",
	})
	public createdAt: Date;

	@Index()
	@Column(id())
	public channelId: Channel["id"];

	@ManyToOne((type) => Channel, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public channel: Channel | null;

	@Column(id())
	public noteId: Note["id"];

	@ManyToOne((type) => Note, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public note: Note | null;
}
