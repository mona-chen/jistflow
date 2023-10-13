import { MigrationInterface, QueryRunner } from "typeorm";
export class AddMetaOptions1688280713783 implements MigrationInterface {
	name = "AddMetaOptions1688280713783";

	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "meta" ADD "enableServerMachineStats" boolean NOT NULL DEFAULT false`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" ADD "enableIdenticonGeneration" boolean NOT NULL DEFAULT true`,
		);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "meta" DROP COLUMN "enableIdenticonGeneration"`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" DROP COLUMN "enableServerMachineStats"`,
		);
	}
}
