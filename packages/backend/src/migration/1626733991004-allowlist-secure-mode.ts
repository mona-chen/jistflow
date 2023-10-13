import { MigrationInterface, QueryRunner } from "typeorm";
export class allowlistSecureMode1626733991004 implements MigrationInterface {
	name = "allowlistSecureMode1626733991004";
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "meta" ADD "allowedHosts" character varying(256) [] default '{}'`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" ADD "secureMode" bool default false`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" ADD "privateMode" bool default false`,
		);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "allowedHosts"`);
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "secureMode"`);
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "privateMode"`);
	}
}
