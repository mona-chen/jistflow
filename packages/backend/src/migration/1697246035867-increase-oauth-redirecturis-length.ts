import { MigrationInterface, QueryRunner } from "typeorm";

export class IncreaseOAuthRedirecturisLength1697246035867 implements MigrationInterface {
    name = 'IncreaseOAuthRedirecturisLength1697246035867'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "oauth_app" ALTER "redirectUris" TYPE character varying(512) array`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "oauth_app" ALTER "redirectUris" TYPE character varying(64) array`);
    }
}
