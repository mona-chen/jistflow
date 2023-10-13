import { MigrationInterface, QueryRunner } from "typeorm";
export class IndexNoteUrl1695748502971 implements MigrationInterface {
	name = "IndexNoteUrl1695748502971";
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_note_url" ON "note" ("url") `);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP INDEX IF EXISTS "IDX_note_url"`);
	}
}
