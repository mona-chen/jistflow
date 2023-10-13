import { MigrationInterface, QueryRunner } from "typeorm";
export class FixFirefishAgain1668831378728 implements MigrationInterface {
	name = "FixFirefishAgain1668831378728";

	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`UPDATE "meta" SET "useStarForReactionFallback" = TRUE`,
		);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`UPDATE "meta" SET "useStarForReactionFallback" = FALSE`,
		);
	}
}
