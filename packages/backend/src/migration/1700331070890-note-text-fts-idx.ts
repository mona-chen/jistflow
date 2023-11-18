import { MigrationInterface, QueryRunner } from "typeorm"

export class NoteTextFtsIdx1700331070890 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);
        const total = await queryRunner.query(`SELECT COUNT(*) FROM "note"`);
        if (total && total.length > 0) {
            const count = BigInt(total[0].count);
            console.log(`Indexing the "note" table for full text search, please hang tight!`);
            console.log(`You have ${count} notes in your database. This process will take an estimated ${count / 1000000n * 45n} seconds, though the exact duration depends on your hardware configuration.`);
        }
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "note_text_fts_idx" ON "note" USING gin ("text" gin_trgm_ops)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "note_text_fts_idx"`);
        await queryRunner.query(`DROP EXTENSION IF EXISTS pg_trgm`);
    }
}
