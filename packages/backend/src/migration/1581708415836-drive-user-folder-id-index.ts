import { MigrationInterface, QueryRunner } from "typeorm";
export class driveUserFolderIdIndex1581708415836 implements MigrationInterface {
	constructor() {
		this.name = "driveUserFolderIdIndex1581708415836";
	}
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE INDEX "IDX_55720b33a61a7c806a8215b825" ON "drive_file" ("userId", "folderId", "id") `,
			undefined,
		);
	}
	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`DROP INDEX "IDX_55720b33a61a7c806a8215b825"`,
			undefined,
		);
	}
}
