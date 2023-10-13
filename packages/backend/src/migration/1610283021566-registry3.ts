import { MigrationInterface, QueryRunner } from "typeorm";
export class registry31610283021566 implements MigrationInterface {
	constructor() {
		this.name = "registry31610283021566";
	}
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "registry_item" ALTER COLUMN "value" DROP NOT NULL`,
		);
	}
	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "registry_item" ALTER COLUMN "value" SET NOT NULL`,
		);
	}
}
