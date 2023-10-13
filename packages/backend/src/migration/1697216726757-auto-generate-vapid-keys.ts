import { MigrationInterface, QueryRunner } from "typeorm"
import push from 'web-push';

export class AutoGenerateVapidKeys1697216726757 implements MigrationInterface {
    // Based on FoundKey's 1668374092227-forceEnablePush.js
    name = 'AutoGenerateVapidKeys1697216726757';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // set VAPID keys if not yet set
        const { publicKey, privateKey } = push.generateVAPIDKeys();
        await queryRunner.query(`UPDATE "meta" SET "swPublicKey" = $1, "swPrivateKey" = $2 WHERE "swPublicKey" IS NULL OR "swPrivateKey" IS NULL`, [publicKey, privateKey]);

        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "enableServiceWorker"`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "swPublicKey" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "swPrivateKey" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "swPrivateKey" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "swPublicKey" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "meta" ADD "enableServiceWorker" boolean NOT NULL DEFAULT false`);
        // since VAPID keys are set and the service worker may have been enabled before, make sure it is now enabled
        await queryRunner.query(`UPDATE "meta" SET "enableServiceWorker" = true`);
        // can't unset the VAPID keys because we do not know if we set them in the migration
    }
}
