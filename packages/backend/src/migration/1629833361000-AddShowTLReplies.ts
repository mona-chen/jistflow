import { MigrationInterface, QueryRunner } from "typeorm";
export class addShowTLReplies1629833361000 implements MigrationInterface {
	constructor() {
		this.name = "addShowTLReplies1629833361000";
	}
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "user" ADD "showTimelineReplies" boolean NOT NULL DEFAULT false`,
		);
		await queryRunner.query(
			`COMMENT ON COLUMN "user"."showTimelineReplies" IS 'Whether to show users replying to other users in the timeline.'`,
		);
	}
	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "user" DROP COLUMN "showTimelineReplies"`,
		);
	}
}
