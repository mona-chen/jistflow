import { MigrationInterface, QueryRunner } from "typeorm";
export class AddHiddenPosts1682891891317 implements MigrationInterface {
	name = "AddHiddenPosts1682891891317";

	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TYPE note_visibility_enum ADD VALUE IF NOT EXISTS 'hidden'`,
		);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TYPE note_visibility_enum REMOVE VALUE IF EXISTS 'hidden'`,
		);
	}
}
