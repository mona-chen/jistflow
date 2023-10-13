import { MigrationInterface, QueryRunner } from "typeorm";
export class PollChoiceLength1673336077243 implements MigrationInterface {
	name = "PollChoiceLength1673336077243";

	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "poll" ALTER COLUMN "choices" TYPE character varying(256) array`,
		);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "poll" ALTER COLUMN "choices" TYPE character varying(128) array`,
		);
	}
}
