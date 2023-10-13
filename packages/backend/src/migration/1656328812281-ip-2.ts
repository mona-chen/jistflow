import { MigrationInterface, QueryRunner } from "typeorm";
export class ip21656328812281 implements MigrationInterface {
	name = "ip21656328812281";

	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "user_ip" DROP CONSTRAINT "FK_7f7f1c66f48e9a8e18a33bc5150"`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" ADD "enableIpLogging" boolean NOT NULL DEFAULT false`,
		);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "enableIpLogging"`);
		await queryRunner.query(
			`ALTER TABLE "user_ip" ADD CONSTRAINT "FK_7f7f1c66f48e9a8e18a33bc5150" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
	}
}
