import { MigrationInterface, QueryRunner } from "typeorm";
export class room1565634203341 implements MigrationInterface {
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "user_profile" ADD "room" jsonb NOT NULL DEFAULT '{}'`,
		);
	}
	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "user_profile" DROP COLUMN "room"`);
	}
}
