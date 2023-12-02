import {
	Column,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	PrimaryColumn,
} from "typeorm";
import { id } from "../id.js";
import { User } from "./user.js";

@Entity()
export class ModerationLog {
	@PrimaryColumn(id())
	public id: string;

	@Column("timestamp with time zone", {
		comment: "The created date of the ModerationLog.",
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

	@Column("varchar", {
		length: 128,
	})
	public type: string;

	@Column("jsonb")
	public info: Record<string, any>;
}
