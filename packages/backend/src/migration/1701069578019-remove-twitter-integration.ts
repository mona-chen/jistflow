import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveTwitterIntegration1701069578019 implements MigrationInterface {
	name = "RemoveTwitterIntegration1701069578019";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "meta" DROP COLUMN IF EXISTS "enableTwitterIntegration"`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" DROP COLUMN IF EXISTS "twitterConsumerKey"`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" DROP COLUMN IF EXISTS "twitterConsumerSecret"`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "meta" ADD COLUMN IF NOT EXISTS "enableTwitterIntegration" boolean NOT NULL DEFAULT false`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" ADD COLUMN IF NOT EXISTS "twitterConsumerKey" character varying(128)`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" ADD COLUMN IF NOT EXISTS "twitterConsumerSecret" character varying(128)`,
		);
	}
}
