import { MigrationInterface, QueryRunner } from "typeorm";
export class logMessageLength1622681548499 implements MigrationInterface {
	constructor() {
		this.name = "logMessageLength1622681548499";
	}
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "log" ALTER COLUMN "message" TYPE character varying(2048)`,
			undefined,
		);
	}
	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "log" ALTER COLUMN "message" TYPE character varying(1024)`,
			undefined,
		);
	}
}
