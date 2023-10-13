import { MigrationInterface, QueryRunner } from "typeorm";
export class removeViaMobile1636697408073 implements MigrationInterface {
	name = "removeViaMobile1636697408073";

	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "note" DROP COLUMN "viaMobile"`);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "note" ADD "viaMobile" boolean NOT NULL DEFAULT false`,
		);
	}
}
