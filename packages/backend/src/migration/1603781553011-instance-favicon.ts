import { MigrationInterface, QueryRunner } from "typeorm";
export class instanceFavicon1603781553011 implements MigrationInterface {
	constructor() {
		this.name = "instanceFavicon1603781553011";
	}
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "instance" ADD "faviconUrl" character varying(256) DEFAULT null`,
		);
	}
	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "instance" DROP COLUMN "faviconUrl"`);
	}
}
