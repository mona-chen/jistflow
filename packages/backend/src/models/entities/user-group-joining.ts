import {
	Column,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	PrimaryColumn,
} from "typeorm";
import { id } from "../id.js";
import { UserGroup } from "./user-group.js";
import { User } from "./user.js";

@Entity()
@Index(["userId", "userGroupId"], { unique: true })
export class UserGroupJoining {
	@PrimaryColumn(id())
	public id: string;

	@Column("timestamp with time zone", {
		comment: "The created date of the UserGroupJoining.",
	})
	public createdAt: Date;

	@Index()
	@Column({
		...id(),
		comment: "The user ID.",
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
		comment: "The group ID.",
	})
	public userGroupId: UserGroup["id"];

	@ManyToOne((type) => UserGroup, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public userGroup: UserGroup | null;
}
