import { MigrationInterface, QueryRunner } from "typeorm";

export class SecureModeDefaults1697649475796 implements MigrationInterface {
    name = 'SecureModeDefaults1697649475796'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "secureMode" SET DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "secureMode" SET DEFAULT false`);
    }
}
