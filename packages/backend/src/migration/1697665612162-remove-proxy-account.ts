import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveProxyAccount1697665612162 implements MigrationInterface {
    name = 'RemoveProxyAccount1697665612162'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "meta" DROP CONSTRAINT IF EXISTS "FK_ab1bc0c1e209daa77b8e8d212ad"`);
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN IF EXISTS "proxyAccountId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "meta" ADD "proxyAccountId" character varying(32)`);
        await queryRunner.query(`ALTER TABLE "meta" ADD CONSTRAINT "FK_ab1bc0c1e209daa77b8e8d212ad" FOREIGN KEY ("proxyAccountId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }
}
