import { MigrationInterface, QueryRunner } from "typeorm";
export class IndexNoteUserId1695861526125 implements MigrationInterface {
	name = "IndexNoteUserId1695861526125";
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`CREATE INDEX "IDX_note_userId_id" ON "note" ("userId", "id")`);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP INDEX "IDX_note_userId_id"`);
	}
}
