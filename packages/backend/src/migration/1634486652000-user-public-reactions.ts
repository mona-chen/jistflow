import { MigrationInterface, QueryRunner } from "typeorm";
export class userPublicReactions1634486652000 implements MigrationInterface {
	constructor() {
		this.name = "userPublicReactions1634486652000";
	}
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "user_profile" ADD "publicReactions" boolean NOT NULL DEFAULT false`,
		);
	}
	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "user_profile" DROP COLUMN "publicReactions"`,
		);
	}
}
