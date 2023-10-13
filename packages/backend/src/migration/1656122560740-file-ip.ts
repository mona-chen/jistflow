import { MigrationInterface, QueryRunner } from "typeorm";
export class fileIp1656122560740 implements MigrationInterface {
	name = "fileIp1656122560740";

	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "drive_file" ADD "requestHeaders" jsonb DEFAULT '{}'`,
		);
		await queryRunner.query(
			`ALTER TABLE "drive_file" ADD "requestIp" character varying(128)`,
		);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "drive_file" DROP COLUMN "requestIp"`);
		await queryRunner.query(
			`ALTER TABLE "drive_file" DROP COLUMN "requestHeaders"`,
		);
	}
}
