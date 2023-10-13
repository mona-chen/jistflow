import { MigrationInterface, QueryRunner } from "typeorm";
export class instancePinnedPages1605585339718 implements MigrationInterface {
	constructor() {
		this.name = "instancePinnedPages1605585339718";
	}
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "meta" ADD "pinnedPages" character varying(512) array NOT NULL DEFAULT '{"/featured", "/channels", "/explore", "/pages", "/about-misskey"}'::varchar[]`,
		);
	}
	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "pinnedPages"`);
	}
}
