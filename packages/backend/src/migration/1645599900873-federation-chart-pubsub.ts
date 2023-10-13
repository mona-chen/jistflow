import { MigrationInterface, QueryRunner } from "typeorm";
export class federationChartPubsub1645599900873 implements MigrationInterface {
	name = "federationChartPubsub1645599900873";

	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "__chart__federation" ADD "___pubsub" smallint NOT NULL DEFAULT '0'`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart_day__federation" ADD "___pubsub" smallint NOT NULL DEFAULT '0'`,
		);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "__chart_day__federation" DROP COLUMN "___pubsub"`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__federation" DROP COLUMN "___pubsub"`,
		);
	}
}
