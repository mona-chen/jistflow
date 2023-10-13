import { MigrationInterface, QueryRunner } from "typeorm";
export class nsfwDetection61656408772602 implements MigrationInterface {
	name = "nsfwDetection61656408772602";

	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "meta" ADD "enableSensitiveMediaDetectionForVideos" boolean NOT NULL DEFAULT false`,
		);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "meta" DROP COLUMN "enableSensitiveMediaDetectionForVideos"`,
		);
	}
}
