import { MigrationInterface, QueryRunner } from "typeorm";
export class FixFirefish1658981842728 implements MigrationInterface {
	name = "FixFirefish1658981842728";

	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`UPDATE "meta" SET "useStarForReactionFallback" = TRUE;`,
		);
		await queryRunner.query(
			`UPDATE "meta" SET "repositoryUrl" = 'https://codeberg/firefish/firefish'`,
		);
		await queryRunner.query(
			`UPDATE "meta" SET "feedbackUrl" = 'https://codeberg/firefish/firefish/issues'`,
		);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`UPDATE "meta" SET "useStarForReactionFallback" = FALSE;`,
		);
		await queryRunner.query(
			`UPDATE "meta" SET "repositoryUrl" = 'https://codeberg/firefish/firefish'`,
		);
		await queryRunner.query(
			`UPDATE "meta" SET "feedbackUrl" = 'https://codeberg/firefish/firefish/issues'`,
		);
	}
}
