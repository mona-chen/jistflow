import { MigrationInterface, QueryRunner } from "typeorm";

export class ResyncWithOrm1697289658422 implements MigrationInterface {
    name = 'ResyncWithOrm1697289658422'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "abuse_user_report" DROP CONSTRAINT IF EXISTS "fk_7f4e851a35d81b64dda28eee0"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_renote_muting_createdAt"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_renote_muting_muteeId"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_renote_muting_muterId"`);
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "useStarForReactionFallback"`);
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "enableGuestTimeline"`);
        await queryRunner.query(`COMMENT ON COLUMN "notification"."isRead" IS 'Whether the notification was read.'`);
        await queryRunner.query(`COMMENT ON COLUMN "meta"."defaultReaction" IS NULL`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "secureMode" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "privateMode" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "allowedHosts" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "pinnedPages" SET DEFAULT '{/featured,/channels,/explore,/pages,/about-iceshrimp}'`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "repositoryUrl" SET DEFAULT 'https://iceshrimp.dev/iceshrimp/iceshrimp'`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "feedbackUrl" SET DEFAULT 'https://iceshrimp.dev/iceshrimp/iceshrimp/issues/new'`);
        await queryRunner.query(`COMMENT ON COLUMN "renote_muting"."createdAt" IS 'The created date of the Muting.'`);
        await queryRunner.query(`COMMENT ON COLUMN "renote_muting"."muteeId" IS 'The mutee user ID.'`);
        await queryRunner.query(`COMMENT ON COLUMN "renote_muting"."muterId" IS 'The muter user ID.'`);
        await queryRunner.query(`ALTER TABLE "poll" DROP CONSTRAINT IF EXISTS "FK_da851e06d0dfe2ef397d8b1bf1b"`);
        await queryRunner.query(`ALTER TABLE "poll" DROP CONSTRAINT IF EXISTS "UQ_da851e06d0dfe2ef397d8b1bf1b"`);
        await queryRunner.query(`ALTER TYPE "public"."poll_notevisibility_enum" RENAME TO "poll_notevisibility_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."poll_notevisibility_enum" AS ENUM('public', 'home', 'followers', 'specified', 'hidden')`);
        await queryRunner.query(`ALTER TABLE "poll" ALTER COLUMN "noteVisibility" TYPE "public"."poll_notevisibility_enum" USING "noteVisibility"::"text"::"public"."poll_notevisibility_enum"`);
        await queryRunner.query(`DROP TYPE "public"."poll_notevisibility_enum_old"`);
        await queryRunner.query(`ALTER TABLE "user_keypair" DROP CONSTRAINT IF EXISTS "FK_f4853eb41ab722fe05f81cedeb6"`);
        await queryRunner.query(`ALTER TABLE "user_keypair" DROP CONSTRAINT IF EXISTS "UQ_f4853eb41ab722fe05f81cedeb6"`);
        await queryRunner.query(`ALTER TABLE "user_publickey" DROP CONSTRAINT IF EXISTS "FK_10c146e4b39b443ede016f6736d"`);
        await queryRunner.query(`ALTER TABLE "user_publickey" DROP CONSTRAINT IF EXISTS "UQ_10c146e4b39b443ede016f6736d"`);
        await queryRunner.query(`ALTER TABLE "page" ALTER COLUMN "isPublic" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP CONSTRAINT IF EXISTS "FK_51cb79b5555effaf7d69ba1cff9"`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP CONSTRAINT IF EXISTS "UQ_51cb79b5555effaf7d69ba1cff9"`);
        await queryRunner.query(`ALTER TABLE "promo_note" DROP CONSTRAINT IF EXISTS "FK_e263909ca4fe5d57f8d4230dd5c"`);
        await queryRunner.query(`ALTER TABLE "promo_note" DROP CONSTRAINT IF EXISTS "UQ_e263909ca4fe5d57f8d4230dd5c"`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_d1259a2c2b7bb413ff449e8711" ON "renote_muting" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_7eac97594bcac5ffcf2068089b" ON "renote_muting" ("muteeId") `);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_7aa72a5fe76019bfe8e5e0e8b7" ON "renote_muting" ("muterId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_0d801c609cec4e9eb4b6b4490c" ON "renote_muting" ("muterId", "muteeId") `);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_a9021cc2e1feb5f72d3db6e9f5" ON "abuse_user_report" ("targetUserId") `);
        await queryRunner.query(`DELETE FROM "renote_muting" WHERE NOT EXISTS (select 1 from "user" where "user"."id" = "renote_muting"."muterId")`);
        await queryRunner.query(`DELETE FROM "renote_muting" WHERE NOT EXISTS (select 1 from "user" where "user"."id" = "renote_muting"."muteeId")`);
        await queryRunner.query(`ALTER TABLE "renote_muting" ADD CONSTRAINT "FK_7eac97594bcac5ffcf2068089b6" FOREIGN KEY ("muteeId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "renote_muting" ADD CONSTRAINT "FK_7aa72a5fe76019bfe8e5e0e8b7d" FOREIGN KEY ("muterId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "abuse_user_report" ADD CONSTRAINT "FK_a9021cc2e1feb5f72d3db6e9f5f" FOREIGN KEY ("targetUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "poll" ADD CONSTRAINT "FK_da851e06d0dfe2ef397d8b1bf1b" FOREIGN KEY ("noteId") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_keypair" ADD CONSTRAINT "FK_f4853eb41ab722fe05f81cedeb6" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_publickey" ADD CONSTRAINT "FK_10c146e4b39b443ede016f6736d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD CONSTRAINT "FK_51cb79b5555effaf7d69ba1cff9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "promo_note" ADD CONSTRAINT "FK_e263909ca4fe5d57f8d4230dd5c" FOREIGN KEY ("noteId") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "promo_note" DROP CONSTRAINT "FK_e263909ca4fe5d57f8d4230dd5c"`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP CONSTRAINT "FK_51cb79b5555effaf7d69ba1cff9"`);
        await queryRunner.query(`ALTER TABLE "user_publickey" DROP CONSTRAINT "FK_10c146e4b39b443ede016f6736d"`);
        await queryRunner.query(`ALTER TABLE "user_keypair" DROP CONSTRAINT "FK_f4853eb41ab722fe05f81cedeb6"`);
        await queryRunner.query(`ALTER TABLE "poll" DROP CONSTRAINT "FK_da851e06d0dfe2ef397d8b1bf1b"`);
        await queryRunner.query(`ALTER TABLE "abuse_user_report" DROP CONSTRAINT "FK_a9021cc2e1feb5f72d3db6e9f5f"`);
        await queryRunner.query(`ALTER TABLE "renote_muting" DROP CONSTRAINT "FK_7aa72a5fe76019bfe8e5e0e8b7d"`);
        await queryRunner.query(`ALTER TABLE "renote_muting" DROP CONSTRAINT "FK_7eac97594bcac5ffcf2068089b6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a9021cc2e1feb5f72d3db6e9f5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0d801c609cec4e9eb4b6b4490c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7aa72a5fe76019bfe8e5e0e8b7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7eac97594bcac5ffcf2068089b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d1259a2c2b7bb413ff449e8711"`);
        await queryRunner.query(`ALTER TABLE "promo_note" ADD CONSTRAINT "UQ_e263909ca4fe5d57f8d4230dd5c" UNIQUE ("noteId")`);
        await queryRunner.query(`ALTER TABLE "promo_note" ADD CONSTRAINT "FK_e263909ca4fe5d57f8d4230dd5c" FOREIGN KEY ("noteId") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD CONSTRAINT "UQ_51cb79b5555effaf7d69ba1cff9" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD CONSTRAINT "FK_51cb79b5555effaf7d69ba1cff9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "page" ALTER COLUMN "isPublic" SET DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "user_publickey" ADD CONSTRAINT "UQ_10c146e4b39b443ede016f6736d" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "user_publickey" ADD CONSTRAINT "FK_10c146e4b39b443ede016f6736d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_keypair" ADD CONSTRAINT "UQ_f4853eb41ab722fe05f81cedeb6" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "user_keypair" ADD CONSTRAINT "FK_f4853eb41ab722fe05f81cedeb6" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`CREATE TYPE "public"."poll_notevisibility_enum_old" AS ENUM('public', 'home', 'followers', 'specified')`);
        await queryRunner.query(`ALTER TABLE "poll" ALTER COLUMN "noteVisibility" TYPE "public"."poll_notevisibility_enum_old" USING "noteVisibility"::"text"::"public"."poll_notevisibility_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."poll_notevisibility_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."poll_notevisibility_enum_old" RENAME TO "poll_notevisibility_enum"`);
        await queryRunner.query(`ALTER TABLE "poll" ADD CONSTRAINT "UQ_da851e06d0dfe2ef397d8b1bf1b" UNIQUE ("noteId")`);
        await queryRunner.query(`ALTER TABLE "poll" ADD CONSTRAINT "FK_da851e06d0dfe2ef397d8b1bf1b" FOREIGN KEY ("noteId") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`COMMENT ON COLUMN "renote_muting"."muterId" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "renote_muting"."muteeId" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "renote_muting"."createdAt" IS NULL`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "feedbackUrl" SET DEFAULT 'https://codeberg.org/firefish/firefish/issues'`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "repositoryUrl" SET DEFAULT 'https://codeberg.org/firefish/firefish'`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "pinnedPages" SET DEFAULT '{/featured,/channels,/explore,/pages,/about-misskey}'`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "allowedHosts" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "privateMode" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "secureMode" DROP NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "meta"."defaultReaction" IS 'The fallback reaction for emoji reacts'`);
        await queryRunner.query(`COMMENT ON COLUMN "notification"."isRead" IS 'Whether the Notification is read.'`);
        await queryRunner.query(`ALTER TABLE "meta" ADD "enableGuestTimeline" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "meta" ADD "useStarForReactionFallback" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`CREATE INDEX "IDX_renote_muting_muterId" ON "muting" ("muterId") `);
        await queryRunner.query(`CREATE INDEX "IDX_renote_muting_muteeId" ON "muting" ("muteeId") `);
        await queryRunner.query(`CREATE INDEX "IDX_renote_muting_createdAt" ON "muting" ("createdAt") `);
        await queryRunner.query(`ALTER TABLE "abuse_user_report" ADD CONSTRAINT "fk_7f4e851a35d81b64dda28eee0" FOREIGN KEY ("targetUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
