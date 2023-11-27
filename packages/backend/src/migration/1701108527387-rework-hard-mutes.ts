import { MigrationInterface, QueryRunner } from "typeorm";

export class ReworkHardMutes1701108527387 implements MigrationInterface {
    name = 'ReworkHardMutes1701108527387'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "muted_note" DROP CONSTRAINT "FK_d8e07aa18c2d64e86201601aec1"`);
        await queryRunner.query(`ALTER TABLE "muted_note" DROP CONSTRAINT "FK_70ab9786313d78e4201d81cdb89"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a8c6bfd637d3f1d67a27c48e27"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_636e977ff90b23676fb5624b25"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d8e07aa18c2d64e86201601aec"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_70ab9786313d78e4201d81cdb8"`);
        await queryRunner.query(`DROP TABLE "muted_note"`);
        await queryRunner.query(`DROP TYPE "public"."muted_note_reason_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."muted_note_reason_enum" AS ENUM('word', 'manual', 'spam', 'other')`);
        await queryRunner.query(`CREATE TABLE "muted_note" ("id" character varying(32) NOT NULL, "noteId" character varying(32) NOT NULL, "userId" character varying(32) NOT NULL, "reason" "public"."muted_note_reason_enum" NOT NULL, CONSTRAINT "PK_897e2eff1c0b9b64e55ca1418a4" PRIMARY KEY ("id")); COMMENT ON COLUMN "muted_note"."noteId" IS 'The note ID.'; COMMENT ON COLUMN "muted_note"."userId" IS 'The user ID.'; COMMENT ON COLUMN "muted_note"."reason" IS 'The reason of the MutedNote.'`);
        await queryRunner.query(`CREATE INDEX "IDX_70ab9786313d78e4201d81cdb8" ON "muted_note" ("noteId") `);
        await queryRunner.query(`CREATE INDEX "IDX_d8e07aa18c2d64e86201601aec" ON "muted_note" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_636e977ff90b23676fb5624b25" ON "muted_note" ("reason") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_a8c6bfd637d3f1d67a27c48e27" ON "muted_note" ("noteId", "userId") `);
        await queryRunner.query(`ALTER TABLE "muted_note" ADD CONSTRAINT "FK_70ab9786313d78e4201d81cdb89" FOREIGN KEY ("noteId") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "muted_note" ADD CONSTRAINT "FK_d8e07aa18c2d64e86201601aec1" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }
}
