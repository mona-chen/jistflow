import { MigrationInterface, QueryRunner } from "typeorm";
export class ad21620364649428 implements MigrationInterface {
	constructor() {
		this.name = "ad21620364649428";
	}
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "ad" ADD "ratio" integer NOT NULL DEFAULT '1'`,
		);
	}
	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "ad" DROP COLUMN "ratio"`);
	}
}
