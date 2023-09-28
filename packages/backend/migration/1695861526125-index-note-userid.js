export class IndexNoteUserId1695861526125 {
	name = "IndexNoteUserId1695861526125";
	async up(queryRunner) {
		await queryRunner.query(`CREATE INDEX "IDX_note_userId_id" ON "note" ("userId", "id")`);
	}

	async down(queryRunner) {
		await queryRunner.query(`DROP INDEX "IDX_note_userId_id"`);
	}
}
