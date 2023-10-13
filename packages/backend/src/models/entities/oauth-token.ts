import { Entity, PrimaryColumn, Column, Index, ManyToOne, JoinColumn } from "typeorm";
import { id } from "../id.js";
import { OAuthApp } from "@/models/entities/oauth-app.js";
import { User } from "@/models/entities/user.js";

@Entity('oauth_token')
export class OAuthToken {
	@PrimaryColumn(id())
	public id: string;

	@Column("timestamp with time zone", {
		comment: "The created date of the OAuth token",
	})
	public createdAt: Date;

	@Column(id())
	public appId: OAuthApp["id"];

	@ManyToOne(() => OAuthApp, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public app: OAuthApp;

	@Column(id())
	public userId: User["id"];

	@ManyToOne(() => User, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public user: User;

	@Index()
	@Column("varchar", {
		length: 64,
		comment: "The auth code for the OAuth token",
	})
	public code: string;

	@Index()
	@Column("varchar", {
		length: 64,
		comment: "The OAuth token",
	})
	public token: string;

	@Column("boolean", {
		comment: "Whether or not the token has been activated",
	})
	public active: boolean;

	@Column("varchar", {
		length: 64,
		array: true,
		comment: "The scopes requested by the OAuth token",
	})
	public scopes: string[];

	@Column("varchar", {
		length: 64,
		comment: "The redirect URI of the OAuth token",
	})
	public redirectUri: string;
}
