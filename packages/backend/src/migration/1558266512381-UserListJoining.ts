import { MigrationInterface, QueryRunner } from "typeorm";
export class UserListJoining1558266512381 implements MigrationInterface {
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE UNIQUE INDEX "IDX_90f7da835e4c10aca6853621e1" ON "user_list_joining" ("userId", "userListId") `,
		);
	}
	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP INDEX "IDX_90f7da835e4c10aca6853621e1"`);
	}
}
