import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOAuthTables1697226201723 implements MigrationInterface {
    name = 'AddOAuthTables1697226201723'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "oauth_app" ("id" character varying(32) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "clientId" character varying(64) NOT NULL, "clientSecret" character varying(64) NOT NULL, "name" character varying(128) NOT NULL, "website" character varying(256), "scopes" character varying(64) array NOT NULL, "redirectUris" character varying(64) array NOT NULL, CONSTRAINT "PK_3256b97c0a3ee2d67240805dca4" PRIMARY KEY ("id")); COMMENT ON COLUMN "oauth_app"."createdAt" IS 'The created date of the OAuth application'; COMMENT ON COLUMN "oauth_app"."clientId" IS 'The client id of the OAuth application'; COMMENT ON COLUMN "oauth_app"."clientSecret" IS 'The client secret of the OAuth application'; COMMENT ON COLUMN "oauth_app"."name" IS 'The name of the OAuth application'; COMMENT ON COLUMN "oauth_app"."website" IS 'The website of the OAuth application'; COMMENT ON COLUMN "oauth_app"."scopes" IS 'The scopes requested by the OAuth application'; COMMENT ON COLUMN "oauth_app"."redirectUris" IS 'The redirect URIs of the OAuth application'`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_65b61f406c811241e1315a2f82" ON "oauth_app" ("clientId") `);
        await queryRunner.query(`CREATE TABLE "oauth_token" ("id" character varying(32) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "appId" character varying(32) NOT NULL, "userId" character varying(32) NOT NULL, "code" character varying(64) NOT NULL, "token" character varying(64) NOT NULL, "active" boolean NOT NULL, "scopes" character varying(64) array NOT NULL, "redirectUri" character varying(64) NOT NULL, CONSTRAINT "PK_7e6a25a3cc4395d1658f5b89c73" PRIMARY KEY ("id")); COMMENT ON COLUMN "oauth_token"."createdAt" IS 'The created date of the OAuth token'; COMMENT ON COLUMN "oauth_token"."code" IS 'The auth code for the OAuth token'; COMMENT ON COLUMN "oauth_token"."token" IS 'The OAuth token'; COMMENT ON COLUMN "oauth_token"."active" IS 'Whether or not the token has been activated'; COMMENT ON COLUMN "oauth_token"."scopes" IS 'The scopes requested by the OAuth token'; COMMENT ON COLUMN "oauth_token"."redirectUri" IS 'The redirect URI of the OAuth token'`);
        await queryRunner.query(`CREATE INDEX "IDX_dc5fe174a8b59025055f0ec136" ON "oauth_token" ("code") `);
        await queryRunner.query(`CREATE INDEX "IDX_2cbeb4b389444bcf4379ef4273" ON "oauth_token" ("token") `);
        await queryRunner.query(`ALTER TABLE "oauth_token" ADD CONSTRAINT "FK_6d3ef28ea647b1449ba79690874" FOREIGN KEY ("appId") REFERENCES "oauth_app"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "oauth_token" ADD CONSTRAINT "FK_f6b4b1ac66b753feab5d831ba04" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "oauth_token" DROP CONSTRAINT "FK_f6b4b1ac66b753feab5d831ba04"`);
        await queryRunner.query(`ALTER TABLE "oauth_token" DROP CONSTRAINT "FK_6d3ef28ea647b1449ba79690874"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2cbeb4b389444bcf4379ef4273"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_dc5fe174a8b59025055f0ec136"`);
        await queryRunner.query(`DROP TABLE "oauth_token"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_65b61f406c811241e1315a2f82"`);
        await queryRunner.query(`DROP TABLE "oauth_app"`);
    }

}
