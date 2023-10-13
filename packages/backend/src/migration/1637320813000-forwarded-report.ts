import { MigrationInterface, QueryRunner } from "typeorm";
export class forwardedReport1637320813000 implements MigrationInterface {
	name = "forwardedReport1637320813000";

	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "abuse_user_report" ADD "forwarded" boolean NOT NULL DEFAULT false`,
		);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "abuse_user_report" DROP COLUMN "forwarded"`,
		);
	}
}
