import { MigrationInterface, QueryRunner } from "typeorm";
export class PageTitleHideOption1562448332510 implements MigrationInterface {
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "page" ADD "hideTitleWhenPinned" boolean NOT NULL DEFAULT false`,
		);
	}
	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "page" DROP COLUMN "hideTitleWhenPinned"`,
		);
	}
}
