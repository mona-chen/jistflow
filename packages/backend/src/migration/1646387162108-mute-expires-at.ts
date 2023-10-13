import { MigrationInterface, QueryRunner } from "typeorm";
export class muteExpiresAt1646387162108 implements MigrationInterface {
	name = "muteExpiresAt1646387162108";

	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "muting" ADD "expiresAt" TIMESTAMP WITH TIME ZONE`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_c1fd1c3dfb0627aa36c253fd14" ON "muting" ("expiresAt") `,
		);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`DROP INDEX "public"."IDX_c1fd1c3dfb0627aa36c253fd14"`,
		);
		await queryRunner.query(`ALTER TABLE "muting" DROP COLUMN "expiresAt"`);
	}
}
