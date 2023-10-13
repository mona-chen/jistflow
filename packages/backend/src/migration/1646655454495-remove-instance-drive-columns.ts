import { MigrationInterface, QueryRunner } from "typeorm";
export class removeInstanceDriveColumns1646655454495 implements MigrationInterface {
	name = "removeInstanceDriveColumns1646655454495";

	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "instance" DROP COLUMN "driveUsage"`);
		await queryRunner.query(`ALTER TABLE "instance" DROP COLUMN "driveFiles"`);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "instance" ADD "driveFiles" integer NOT NULL DEFAULT '0'`,
		);
		await queryRunner.query(
			`ALTER TABLE "instance" ADD "driveUsage" bigint NOT NULL DEFAULT '0'`,
		);
	}
}
