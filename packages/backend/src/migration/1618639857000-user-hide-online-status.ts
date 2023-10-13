import { MigrationInterface, QueryRunner } from "typeorm";
export class userHideOnlineStatus1618639857000 implements MigrationInterface {
	constructor() {
		this.name = "userHideOnlineStatus1618639857000";
	}
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "user" ADD "hideOnlineStatus" boolean NOT NULL DEFAULT false`,
		);
	}
	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "user" DROP COLUMN "hideOnlineStatus"`,
		);
	}
}
