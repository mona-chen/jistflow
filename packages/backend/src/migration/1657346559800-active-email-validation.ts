import { MigrationInterface, QueryRunner } from "typeorm";
export class activeEmailValidation1657346559800 implements MigrationInterface {
	name = "activeEmailValidation1657346559800";

	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "meta" ADD "enableActiveEmailValidation" boolean NOT NULL DEFAULT true`,
		);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "meta" DROP COLUMN "enableActiveEmailValidation"`,
		);
	}
}
