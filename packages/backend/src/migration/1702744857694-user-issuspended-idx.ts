import { MigrationInterface, QueryRunner } from "typeorm";

export class UserIssuspendedIdx1702744857694 implements MigrationInterface {
    name = 'UserIssuspendedIdx1702744857694'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_8977c6037a7bc2cb0c84b6d4db" ON "user" ("isSuspended")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_8977c6037a7bc2cb0c84b6d4db"`);
    }
}
