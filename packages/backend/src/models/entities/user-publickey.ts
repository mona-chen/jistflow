import {
	Column,
	Entity,
	Index,
	JoinColumn,
	OneToOne,
	PrimaryColumn,
} from "typeorm";
import { id } from "../id.js";
import { User } from "./user.js";

@Entity()
export class UserPublickey {
	@PrimaryColumn(id())
	public userId: User["id"];

	@OneToOne((type) => User, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public user: User | null;

	@Index({ unique: true })
	@Column("varchar", {
		length: 512,
	})
	public keyId: string;

	@Column("varchar", {
		length: 4096,
	})
	public keyPem: string;

	constructor(data: Partial<UserPublickey>) {
		if (data == null) return;

		for (const [k, v] of Object.entries(data)) {
			(this as any)[k] = v;
		}
	}
}
