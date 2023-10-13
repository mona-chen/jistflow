import { MigrationInterface, QueryRunner } from "typeorm";
export class removeMaxNoteTextLength1645340161439 implements MigrationInterface {
	name = "removeMaxNoteTextLength1645340161439";

	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "meta" DROP COLUMN "maxNoteTextLength"`,
		);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "meta" ADD "maxNoteTextLength" integer NOT NULL DEFAULT '500'`,
		);
	}
}
