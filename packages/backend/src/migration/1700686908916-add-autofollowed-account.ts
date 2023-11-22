import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAutofollowedAccount1700686908916 implements MigrationInterface {
	name = "AddAutofollowedAccount1700686908916";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "meta" ADD "autofollowedAccount" character varying(128)`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "meta" DROP COLUMN "autofollowedAccount"`,
		);
	}
}
