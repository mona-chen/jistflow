import { MigrationInterface, QueryRunner } from "typeorm";
export class GuestTimeline1660068273737 implements MigrationInterface {
	name = "GuestTimeline1660068273737";
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "meta" ADD "enableGuestTimeline" boolean NOT NULL DEFAULT false`,
		);
	}
	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "meta" DROP COLUMN "enableGuestTimeline"`,
		);
	}
}
