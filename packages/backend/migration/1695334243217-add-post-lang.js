export class AddPostLang1695334243217 {
	name = "AddPostLang1695334243217";

	async up(queryRunner) {
		await queryRunner.query(
			`ALTER TABLE "note" ADD "lang" character varying(10)`,
		);
	}

	async down(queryRunner) {
		await queryRunner.query(`ALTER TABLE "note" DROP COLUMN "lang"`);
	}
}
