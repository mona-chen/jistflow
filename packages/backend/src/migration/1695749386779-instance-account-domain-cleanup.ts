import { MigrationInterface, QueryRunner } from "typeorm";
export class InstanceAccountDomainCleanup1695749386779 implements MigrationInterface {
	name = "InstanceAccountDomainCleanup1695749386779";
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "instance" DROP COLUMN IF EXISTS "accountDomain"`);
		await queryRunner.query(`ALTER TABLE "instance" DROP COLUMN IF EXISTS "account_domain"`);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		// This migration is only here to ensure consistent state if upgrading from certain dev branch commits, skipping the final TypeORM migration.
		// As such, there is no need to revert it.
	}
}
