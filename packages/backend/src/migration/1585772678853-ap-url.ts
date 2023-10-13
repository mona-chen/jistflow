import { MigrationInterface, QueryRunner } from "typeorm";
export class apUrl1585772678853 implements MigrationInterface {
	constructor() {
		this.name = "apUrl1585772678853";
	}
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "note" ADD "url" character varying(512)`,
			undefined,
		);
	}
	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "note" DROP COLUMN "url"`, undefined);
	}
}
