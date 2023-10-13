import { MigrationInterface, QueryRunner } from "typeorm";
export class addSensitiveIndex1597385880794 implements MigrationInterface {
	constructor() {
		this.name = "addSensitiveIndex1597385880794";
	}
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE INDEX "IDX_a7eba67f8b3fa27271e85d2e26" ON "drive_file" ("isSensitive") `,
		);
	}
	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP INDEX "IDX_a7eba67f8b3fa27271e85d2e26"`);
	}
}
