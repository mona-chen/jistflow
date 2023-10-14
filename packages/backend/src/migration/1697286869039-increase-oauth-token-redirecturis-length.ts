import { MigrationInterface, QueryRunner } from "typeorm";

export class IncreaseOauthTokenRedirecturisLength1697286869039 implements MigrationInterface {
    name = 'IncreaseOauthTokenRedirecturisLength1697286869039'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "oauth_token" ALTER "redirectUri" TYPE character varying(512)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "oauth_token" ALTER "redirectUri" TYPE character varying(64)`);
    }

}
