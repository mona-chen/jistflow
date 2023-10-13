import { MigrationInterface, QueryRunner } from "typeorm";
export class userLastActiveDate1618637372000 implements MigrationInterface {
	constructor() {
		this.name = "userLastActiveDate1618637372000";
	}
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "user" ADD "lastActiveDate" TIMESTAMP WITH TIME ZONE DEFAULT NULL`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_seoignmeoprigmkpodgrjmkpormg" ON "user" ("lastActiveDate") `,
		);
	}
	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP INDEX "IDX_seoignmeoprigmkpodgrjmkpormg"`);
		await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "lastActiveDate"`);
	}
}
