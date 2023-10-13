import { MigrationInterface, QueryRunner } from "typeorm";
export class webhook21648816172177 implements MigrationInterface {
	name = "webhook21648816172177";

	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "webhook" ADD "latestSentAt" TIMESTAMP WITH TIME ZONE`,
		);
		await queryRunner.query(`ALTER TABLE "webhook" ADD "latestStatus" integer`);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "webhook" DROP COLUMN "latestStatus"`);
		await queryRunner.query(`ALTER TABLE "webhook" DROP COLUMN "latestSentAt"`);
	}
}
