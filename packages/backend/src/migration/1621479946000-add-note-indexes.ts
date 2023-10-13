import { MigrationInterface, QueryRunner } from "typeorm";
export class addNoteIndexes1621479946000 implements MigrationInterface {
	constructor() {
		this.name = "addNoteIndexes1621479946000";
	}
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE INDEX "IDX_NOTE_MENTIONS" ON "note" USING gin ("mentions")`,
			undefined,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_NOTE_VISIBLE_USER_IDS" ON "note" USING gin ("visibleUserIds")`,
			undefined,
		);
	}
	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP INDEX "IDX_NOTE_MENTIONS"`, undefined);
		await queryRunner.query(
			`DROP INDEX "IDX_NOTE_VISIBLE_USER_IDS"`,
			undefined,
		);
	}
}
