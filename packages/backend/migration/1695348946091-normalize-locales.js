export class NormalizeLocales1695348946091 {
	name = "NormalizeLocales1695348946091";

	async up(queryRunner) {
		await queryRunner
			.query(`SELECT "id", "lang" FROM "note" WHERE "lang" IS NOT NULL`)
			.then((notes) =>
				Promise.all(
					notes.map((note) => {
						return queryRunner.query(
							'UPDATE "note" SET "lang" = $1 WHERE "id" = $2',
							[note.lang.trim().split("-")[0].split("@")[0], note.id],
						);
					}),
				),
			);
	}

	async down(queryRunner) {
		// The original locales are not stored, so migrating back is not possible.
	}
}
