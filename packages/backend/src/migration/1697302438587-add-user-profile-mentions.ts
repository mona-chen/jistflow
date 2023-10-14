import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserProfileMentions1697302438587 implements MigrationInterface {
    name = 'AddUserProfileMentions1697302438587'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_profile" ADD "mentions" jsonb NOT NULL DEFAULT '[]'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_profile" DROP COLUMN "mentions"`);
    }
}
