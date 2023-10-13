import { MigrationInterface, QueryRunner } from "typeorm";
export class AnnouncementPopup1688845537045 implements MigrationInterface {
	name = "AnnouncementPopup1688845537045";

	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "announcement" ADD "showPopup" boolean NOT NULL DEFAULT false`,
		);
		await queryRunner.query(
			`ALTER TABLE "announcement" ADD "isGoodNews" boolean NOT NULL DEFAULT false`,
		);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "announcement" DROP COLUMN "isGoodNews"`,
		);
		await queryRunner.query(
			`ALTER TABLE "announcement" DROP COLUMN "showPopup"`,
		);
	}
}
