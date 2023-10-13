import { MigrationInterface, QueryRunner } from "typeorm";
export class SpeakAsCat1680426269172 implements MigrationInterface {
	name = "SpeakAsCat1680426269172";

	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
            ALTER TABLE "user"
            ADD "speakAsCat" boolean NOT NULL DEFAULT true
        `);
		await queryRunner.query(`
            COMMENT ON COLUMN "user"."speakAsCat"
						IS 'Whether to speak as a cat if isCat.'
        `);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "speakAsCat"
        `);
	}
}
