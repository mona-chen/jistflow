export class IndexNoteUrl1695748502971 {
	name = "IndexNoteUrl1695748502971";
	async up(queryRunner) {
		await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_note_url" ON "note" ("url") `);
	}

	async down(queryRunner) {
		await queryRunner.query(`DROP INDEX IF EXISTS "IDX_note_url"`);
	}
}
