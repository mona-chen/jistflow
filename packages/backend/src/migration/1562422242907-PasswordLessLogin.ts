import { MigrationInterface, QueryRunner } from "typeorm";
export class PasswordLessLogin1562422242907 implements MigrationInterface {
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "user_profile" ADD COLUMN "usePasswordLessLogin" boolean DEFAULT false NOT NULL`,
		);
	}
	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "user_profile" DROP COLUMN "usePasswordLessLogin"`,
		);
	}
}
