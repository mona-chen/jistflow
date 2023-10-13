import { MigrationInterface, QueryRunner } from "typeorm";
export class objectStorageS3ForcePathStyle1611547387175 implements MigrationInterface {
	constructor() {
		this.name = "objectStorageS3ForcePathStyle1611547387175";
	}
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "meta" ADD "objectStorageS3ForcePathStyle" boolean NOT NULL DEFAULT true`,
		);
	}
	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "meta" DROP COLUMN "objectStorageS3ForcePathStyle"`,
		);
	}
}
