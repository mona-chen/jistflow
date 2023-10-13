import { MigrationInterface, QueryRunner } from "typeorm";
export class CustomEmojiCategory1571220798684 implements MigrationInterface {
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "emoji" ADD "category" character varying(128)`,
			undefined,
		);
	}
	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "emoji" DROP COLUMN "category"`,
			undefined,
		);
	}
}
