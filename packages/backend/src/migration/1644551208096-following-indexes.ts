import { MigrationInterface, QueryRunner } from "typeorm";
export class followingIndexes1644551208096 implements MigrationInterface {
	name = "followingIndexes1644551208096";

	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE INDEX "IDX_4ccd2239268ebbd1b35e318754" ON "following" ("followerHost") `,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_fcdafee716dfe9c3b5fde90f30" ON "following" ("followeeHost") `,
		);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`DROP INDEX "public"."IDX_fcdafee716dfe9c3b5fde90f30"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_4ccd2239268ebbd1b35e318754"`,
		);
	}
}
