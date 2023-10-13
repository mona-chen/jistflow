import { MigrationInterface, QueryRunner } from "typeorm";
export class Page1668828368510 implements MigrationInterface {
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "page" ADD "isPublic" boolean NOT NULL DEFAULT true`,
		);
	}
	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "page" DROP COLUMN "isPublic"`);
	}
}
