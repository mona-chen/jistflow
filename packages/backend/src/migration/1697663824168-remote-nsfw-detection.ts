import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveNsfwDetection1697663824168 implements MigrationInterface {
    name = 'RemoveNsfwDetection1697663824168'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_3b33dff77bb64b23c88151d23e"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_8bdcd3dd2bddb78014999a16ce"`);
        await queryRunner.query(`ALTER TABLE "drive_file" DROP COLUMN IF EXISTS "maybeSensitive"`);
        await queryRunner.query(`ALTER TABLE "drive_file" DROP COLUMN IF EXISTS "maybePorn"`);
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN IF EXISTS "sensitiveMediaDetection"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."meta_sensitivemediadetection_enum"`);
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN IF EXISTS "sensitiveMediaDetectionSensitivity"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."meta_sensitivemediadetectionsensitivity_enum"`);
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN IF EXISTS "setSensitiveFlagAutomatically"`);
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN IF EXISTS "enableSensitiveMediaDetectionForVideos"`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP COLUMN IF EXISTS "autoSensitive"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_profile" ADD "autoSensitive" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "meta" ADD "enableSensitiveMediaDetectionForVideos" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "meta" ADD "setSensitiveFlagAutomatically" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`CREATE TYPE "public"."meta_sensitivemediadetectionsensitivity_enum" AS ENUM('medium', 'low', 'high', 'veryLow', 'veryHigh')`);
        await queryRunner.query(`ALTER TABLE "meta" ADD "sensitiveMediaDetectionSensitivity" "public"."meta_sensitivemediadetectionsensitivity_enum" NOT NULL DEFAULT 'medium'`);
        await queryRunner.query(`CREATE TYPE "public"."meta_sensitivemediadetection_enum" AS ENUM('none', 'all', 'local', 'remote')`);
        await queryRunner.query(`ALTER TABLE "meta" ADD "sensitiveMediaDetection" "public"."meta_sensitivemediadetection_enum" NOT NULL DEFAULT 'none'`);
        await queryRunner.query(`ALTER TABLE "drive_file" ADD "maybePorn" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "drive_file" ADD "maybeSensitive" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`CREATE INDEX "IDX_8bdcd3dd2bddb78014999a16ce" ON "drive_file" ("maybePorn") `);
        await queryRunner.query(`CREATE INDEX "IDX_3b33dff77bb64b23c88151d23e" ON "drive_file" ("maybeSensitive") `);
    }
}
