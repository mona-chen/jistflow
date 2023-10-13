import { MigrationInterface, QueryRunner } from "typeorm";
export class instancePinnedClip1607151207216 implements MigrationInterface {
	constructor() {
		this.name = "instancePinnedClip1607151207216";
	}
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "meta" ADD "pinnedClipId" character varying(32)`,
		);
	}
	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "pinnedClipId"`);
	}
}
