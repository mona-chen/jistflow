import { MigrationInterface, QueryRunner } from "typeorm";
export class driveFileWebpublicType1642613870898 implements MigrationInterface {
	name = "driveFileWebpublicType1642613870898";

	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "drive_file" ADD "webpublicType" character varying(128)`,
		);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "drive_file" DROP COLUMN "webpublicType"`,
		);
	}
}
