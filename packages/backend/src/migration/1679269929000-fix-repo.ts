import { MigrationInterface, QueryRunner } from "typeorm";
export class FixRepo1679269929000 implements MigrationInterface {
	name = "FixRepo1679269929000";

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
			`UPDATE meta SET "repositoryUrl" = 'https://codeberg.org/firefish/firefish'`,
		);
		await queryRunner.query(
			`UPDATE meta SET "feedbackUrl" = 'https://codeberg.org/firefish/firefish/issues'`,
		);
	}
}
