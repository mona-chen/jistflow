import { MigrationInterface, QueryRunner } from "typeorm";
export class UsedUsername1563757595828 implements MigrationInterface {
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "used_username" ("username" character varying(128) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_78fd79d2d24c6ac2f4cc9a31a5d" PRIMARY KEY ("username"))`,
		);
	}
	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE "used_username"`);
	}
}
