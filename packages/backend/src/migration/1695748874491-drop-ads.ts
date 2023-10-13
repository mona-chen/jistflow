import { MigrationInterface, QueryRunner } from "typeorm";
export class DropAds1695748874491 implements MigrationInterface {
	name = "DropAds1695748874491";
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP INDEX IF EXISTS "IDX_2da24ce20ad209f1d9dc032457"`);
		await queryRunner.query(`DROP INDEX IF EXISTS "IDX_1129c2ef687fc272df040bafaa"`);
		await queryRunner.query(`DROP TABLE IF EXISTS "ad"`);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "ad" ("id" character varying(32) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "place" character varying(32) NOT NULL, "priority" character varying(32) NOT NULL, "url" character varying(1024) NOT NULL, "imageUrl" character varying(1024) NOT NULL, "memo" character varying(8192) NOT NULL, CONSTRAINT "PK_0193d5ef09746e88e9ea92c634d" PRIMARY KEY ("id")); COMMENT ON COLUMN "ad"."createdAt" IS 'The created date of the Ad.'; COMMENT ON COLUMN "ad"."expiresAt" IS 'The expired date of the Ad.'`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_1129c2ef687fc272df040bafaa" ON "ad" ("createdAt") `,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_2da24ce20ad209f1d9dc032457" ON "ad" ("expiresAt") `,
		);
		await queryRunner.query(
			`ALTER TABLE "ad" ADD "ratio" integer NOT NULL DEFAULT '1'`,
		);
	}
}
