import { MigrationInterface, QueryRunner } from "typeorm";
export class featuredInjecttion1582019042083 implements MigrationInterface {
	constructor() {
		this.name = "featuredInjecttion1582019042083";
	}
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "user_profile" ADD "injectFeaturedNote" boolean NOT NULL DEFAULT true`,
			undefined,
		);
	}
	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "user_profile" DROP COLUMN "injectFeaturedNote"`,
			undefined,
		);
	}
}
