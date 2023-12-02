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
export class UserList {
	@PrimaryColumn(id())
	public id: string;

	@Column("timestamp with time zone", {
		comment: "The created date of the UserList.",
	})
	public createdAt: Date;

	@Index()
	@Column({
		...id(),
		comment: "The owner ID.",
	})
	public userId: User["id"];

	@ManyToOne((type) => User, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public user: User | null;

	@Column("varchar", {
		length: 128,
		comment: "The name of the UserList.",
	})
	public name: string;
}
