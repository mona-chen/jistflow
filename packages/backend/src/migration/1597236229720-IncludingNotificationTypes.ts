import { MigrationInterface, QueryRunner } from "typeorm";
export class IncludingNotificationTypes1597236229720 implements MigrationInterface {
	constructor() {
		this.name = "IncludingNotificationTypes1597236229720";
	}
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TYPE "user_profile_includingnotificationtypes_enum" AS ENUM('follow', 'mention', 'reply', 'renote', 'quote', 'reaction', 'pollVote', 'receiveFollowRequest', 'followRequestAccepted', 'groupInvited', 'app')`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_profile" ADD "includingNotificationTypes" "user_profile_includingnotificationtypes_enum" array`,
		);
	}
	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "user_profile" DROP COLUMN "includingNotificationTypes"`,
		);
		await queryRunner.query(
			`DROP TYPE "user_profile_includingnotificationtypes_enum"`,
		);
	}
}
