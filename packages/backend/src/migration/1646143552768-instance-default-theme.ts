import { MigrationInterface, QueryRunner } from "typeorm";
export class instanceDefaultTheme1646143552768 implements MigrationInterface {
	name = "instanceDefaultTheme1646143552768";

	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "meta" ADD "defaultLightTheme" character varying(8192)`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" ADD "defaultDarkTheme" character varying(8192)`,
		);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "meta" DROP COLUMN "defaultDarkTheme"`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" DROP COLUMN "defaultLightTheme"`,
		);
	}
}
