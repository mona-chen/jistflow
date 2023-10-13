import { MigrationInterface, QueryRunner } from "typeorm";
export class DonationLink1689136347561 implements MigrationInterface {
	name = "DonationLink1689136347561";

	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "meta" ADD "donationLink" character varying(256)`,
		);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "meta" DROP COLUMN "DonationLink1689136347561"`,
		);
	}
}
