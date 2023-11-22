import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNoteIdUserhostIdx1700623165718 implements MigrationInterface {
    name = 'AddNoteIdUserhostIdx1700623165718'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_note_id_userHost" ON "note" ("id", "userHost") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_note_id_userHost"`);
    }
}
