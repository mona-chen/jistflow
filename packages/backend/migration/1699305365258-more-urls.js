export class MoreUrls1699305365258 {
	name = "MoreUrls1699305365258";

	async up(queryRunner) {
		queryRunner.query(
			`ALTER TABLE "meta" ADD "moreUrls" jsonb NOT NULL DEFAULT '[]'`,
		);
	}

	async down(queryRunner) {
		queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "moreUrls"`);
	}
}
