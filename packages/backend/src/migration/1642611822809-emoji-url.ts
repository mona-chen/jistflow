import { MigrationInterface, QueryRunner } from "typeorm";
export class emojiUrl1642611822809 implements MigrationInterface {
	name = "emojiUrl1642611822809";

	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "emoji" RENAME COLUMN "url" TO "originalUrl"`,
		);
		await queryRunner.query(
			`ALTER TABLE "emoji" ADD "publicUrl" character varying(512) NOT NULL DEFAULT ''`,
		);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "emoji" DROP COLUMN "publicUrl"`);
		await queryRunner.query(
			`ALTER TABLE "emoji" RENAME COLUMN "originalUrl" TO "url"`,
		);
	}
}
