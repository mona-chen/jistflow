import { MigrationInterface, QueryRunner } from "typeorm";
export class objectStorageSetPublicRead1597230137744 implements MigrationInterface {
	constructor() {
		this.name = "objectStorageSetPublicRead1597230137744";
	}
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "meta" ADD "objectStorageSetPublicRead" boolean NOT NULL DEFAULT false`,
		);
	}
	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "meta" DROP COLUMN "objectStorageSetPublicRead"`,
		);
	}
}
