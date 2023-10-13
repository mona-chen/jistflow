import { MigrationInterface, QueryRunner } from "typeorm";
export class announcementEmail1612619156584 implements MigrationInterface {
	constructor() {
		this.name = "announcementEmail1612619156584";
	}
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "user_profile" ADD "receiveAnnouncementEmail" boolean NOT NULL DEFAULT true`,
		);
	}
	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "user_profile" DROP COLUMN "receiveAnnouncementEmail"`,
		);
	}
}
