import { MigrationInterface, QueryRunner } from "typeorm";
export class EmojiSize1684494870830 implements MigrationInterface {
	name = "EmojiSize1684494870830";

	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "emoji" ADD "width" integer`);
		await queryRunner.query(
			`COMMENT ON COLUMN "emoji"."width" IS 'Image width'`,
		);
		await queryRunner.query(`ALTER TABLE "emoji" ADD "height" integer`);
		await queryRunner.query(
			`COMMENT ON COLUMN "emoji"."height" IS 'Image height'`,
		);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "emoji" DROP COLUMN "height"`);
		await queryRunner.query(`ALTER TABLE "emoji" DROP COLUMN "width"`);
	}
}
