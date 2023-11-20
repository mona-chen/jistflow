import { MigrationInterface, QueryRunner } from "typeorm";

export class UserAvatarBannerRefactor1700517975122 implements MigrationInterface {
    name = 'UserAvatarBannerRefactor1700517975122'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "avatarUrl" character varying(512)`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."avatarUrl" IS 'The URL of the avatar DriveFile'`);
        await queryRunner.query(`ALTER TABLE "user" ADD "avatarBlurhash" character varying(128)`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."avatarBlurhash" IS 'The blurhash of the avatar DriveFile'`);
        await queryRunner.query(`ALTER TABLE "user" ADD "bannerUrl" character varying(512)`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."bannerUrl" IS 'The URL of the banner DriveFile'`);
        await queryRunner.query(`ALTER TABLE "user" ADD "bannerBlurhash" character varying(128)`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."bannerBlurhash" IS 'The blurhash of the banner DriveFile'`);

        await queryRunner.query(`UPDATE "user" SET "avatarUrl" = (SELECT COALESCE("thumbnailUrl", "webpublicUrl", "url") FROM "drive_file" WHERE "id" = "user"."avatarId") WHERE "avatarId" IS NOT NULL`);
        await queryRunner.query(`UPDATE "user" SET "avatarBlurhash" = (SELECT "blurhash" FROM "drive_file" WHERE "id" = "user"."avatarId") WHERE "avatarId" IS NOT NULL`);
        await queryRunner.query(`UPDATE "user" SET "bannerUrl" = (SELECT COALESCE("webpublicUrl", "url") FROM "drive_file" WHERE "id" = "user"."bannerId") WHERE "bannerId" IS NOT NULL`);
        await queryRunner.query(`UPDATE "user" SET "bannerBlurhash" = (SELECT "blurhash" FROM "drive_file" WHERE "id" = "user"."bannerId") WHERE "bannerId" IS NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "user"."bannerBlurhash" IS 'The blurhash of the banner DriveFile'`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "bannerBlurhash"`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."bannerUrl" IS 'The URL of the banner DriveFile'`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "bannerUrl"`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."avatarBlurhash" IS 'The blurhash of the avatar DriveFile'`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "avatarBlurhash"`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."avatarUrl" IS 'The URL of the avatar DriveFile'`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "avatarUrl"`);
    }
}
