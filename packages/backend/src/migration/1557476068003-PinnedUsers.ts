import { MigrationInterface, QueryRunner } from "typeorm";
export class PinnedUsers1557476068003 implements MigrationInterface {
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "meta" ADD "pinnedUsers" character varying(256) array NOT NULL DEFAULT '{}'::varchar[]`,
		);
	}
	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "pinnedUsers"`);
	}
}
