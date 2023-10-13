import { MigrationInterface, QueryRunner } from "typeorm";
export class driveCapacityOverrideMb1655813815729 implements MigrationInterface {
	name = "driveCapacityOverrideMb1655813815729";

	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "user" ADD "driveCapacityOverrideMb" integer`,
		);
		await queryRunner.query(
			`COMMENT ON COLUMN "user"."driveCapacityOverrideMb" IS 'Overrides user drive capacity limit'`,
		);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`COMMENT ON COLUMN "user"."driveCapacityOverrideMb" IS 'Overrides user drive capacity limit'`,
		);
		await queryRunner.query(
			`ALTER TABLE "user" DROP COLUMN "driveCapacityOverrideMb"`,
		);
	}
}
