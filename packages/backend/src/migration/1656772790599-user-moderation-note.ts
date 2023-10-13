import { MigrationInterface, QueryRunner } from "typeorm";
export class userModerationNote1656772790599 implements MigrationInterface {
	name = "userModerationNote1656772790599";

	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "user_profile" ADD "moderationNote" character varying(8192) NOT NULL DEFAULT ''`,
		);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "user_profile" DROP COLUMN "moderationNote"`,
		);
	}
}
