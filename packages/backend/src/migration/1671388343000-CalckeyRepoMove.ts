import { MigrationInterface, QueryRunner } from "typeorm";
/* "FirefishRepoMove1671388343000" is a class that updates the "useStarForReactionFallback" column in
the "meta" table to TRUE */
export class FirefishRepoMove1671388343000 implements MigrationInterface {
	name = "FirefishRepoMove1671388343000";

	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`UPDATE meta SET "repositoryUrl" = 'https://codeberg/firefish/firefish'`,
		);
		await queryRunner.query(
			`UPDATE meta SET "feedbackUrl" = 'https://codeberg/firefish/firefish/issues'`,
		);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`UPDATE meta SET "repositoryUrl" = 'https://codeberg/firefish/firefish'`,
		);
		await queryRunner.query(
			`UPDATE meta SET "feedbackUrl" = 'https://codeberg/firefish/firefish/issues'`,
		);
	}
}
