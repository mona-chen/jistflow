import { MigrationInterface, QueryRunner } from "typeorm";
export class FirefishRepo1689739513827 implements MigrationInterface {
	name = "FirefishRepo1689739513827";

	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`UPDATE meta SET "repositoryUrl" = 'https://codeberg.org/firefish/firefish'`,
		);
		await queryRunner.query(
			`UPDATE meta SET "feedbackUrl" = 'https://codeberg.org/firefish/firefish/issues'`,
		);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`UPDATE meta SET "repositoryUrl" = 'https://codeberg.org/calckey/calckey'`,
		);
		await queryRunner.query(
			`UPDATE meta SET "feedbackUrl" = 'https://codeberg.org/calckey/calckey/firefish/firefish/issues'`,
		);
	}
}
