import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNoteCreatedatUseridIdx1702680809638 implements MigrationInterface {
    name = 'AddNoteCreatedatUseridIdx1702680809638'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_note_createdAt_userId" ON "note" ("createdAt", "userId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_note_createdAt_userId"`);
    }
}
