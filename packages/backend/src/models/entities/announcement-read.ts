import {
	Column,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	PrimaryColumn,
} from "typeorm";
import { id } from "../id.js";
import { Announcement } from "./announcement.js";
import { User } from "./user.js";

@Entity()
@Index(["userId", "announcementId"], { unique: true })
export class AnnouncementRead {
	@PrimaryColumn(id())
	public id: string;

	@Column("timestamp with time zone", {
		comment: "The created date of the AnnouncementRead.",
	})
	public createdAt: Date;

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
	public announcementId: Announcement["id"];

	@ManyToOne((type) => Announcement, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public announcement: Announcement | null;
}
