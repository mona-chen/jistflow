import { MigrationInterface, QueryRunner } from "typeorm";

export class UserListOptions1697733603329 implements MigrationInterface {
    name = 'UserListOptions1697733603329'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_list" ADD "hideFromHomeTl" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`COMMENT ON COLUMN "user_list"."hideFromHomeTl" IS 'Whether posts from list members should be hidden from the home timeline.'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "user_list"."hideFromHomeTl" IS 'Whether posts from list members should be hidden from the home timeline.'`);
        await queryRunner.query(`ALTER TABLE "user_list" DROP COLUMN "hideFromHomeTl"`);
    }
}
