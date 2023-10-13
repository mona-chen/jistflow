import { MigrationInterface, QueryRunner } from "typeorm";
export class fixChannelUserId1629288472000 implements MigrationInterface {
	constructor() {
		this.name = "fixChannelUserId1629288472000";
	}
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "channel" ALTER COLUMN "userId" DROP NOT NULL;`,
		);
	}
	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "channel" ALTER COLUMN "userId" SET NOT NULL;`,
		);
	}
}
