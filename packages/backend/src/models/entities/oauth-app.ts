import { Entity, PrimaryColumn, Column, Index } from "typeorm";
import { id } from "../id.js";

@Entity('oauth_app')
export class OAuthApp {
	@PrimaryColumn(id())
	public id: string;

	@Column("timestamp with time zone", {
		comment: "The created date of the OAuth application",
	})
	public createdAt: Date;

	@Index({ unique: true })
	@Column("varchar", {
		length: 64,
		comment: "The client id of the OAuth application",
	})
	public clientId: string;

	@Column("varchar", {
		length: 64,
		comment: "The client secret of the OAuth application",
	})
	public clientSecret: string;

	@Column("varchar", {
		length: 128,
		comment: "The name of the OAuth application",
	})
	public name: string;

	@Column("varchar", {
		length: 256,
		nullable: true,
		comment: "The website of the OAuth application",
	})
	public website: string | null;

	@Column("varchar", {
		length: 64,
		array: true,
		comment: "The scopes requested by the OAuth application",
	})
	public scopes: string[];

	@Column("varchar", {
		length: 512,
		array: true,
		comment: "The redirect URIs of the OAuth application",
	})
	public redirectUris: string[];
}
