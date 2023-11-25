import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "@/models/entities/user.js";
import { id } from "../id.js";

@Entity()
export class HtmlUserCacheEntry {
	@PrimaryColumn(id())
	public userId: User["id"];

	@ManyToOne((type) => User, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public user: User | null;

	@Column("timestamp with time zone", { nullable: true })
	public updatedAt: Date;

	@Column("text", { nullable: true })
	public bio: string | null;

	@Column("jsonb", {
		default: [],
	})
	public fields: MastodonEntity.Field[];
}
