import { MigrationInterface, QueryRunner } from "typeorm";
export class emailRequiredForSignup1633068642000 implements MigrationInterface {
	constructor() {
		this.name = "emailRequiredForSignup1633068642000";
	}
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "meta" ADD "emailRequiredForSignup" boolean NOT NULL DEFAULT false`,
		);
	}
	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "meta" DROP COLUMN "emailRequiredForSignup"`,
		);
	}
}
