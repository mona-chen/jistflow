export class InstanceAccountDomainCleanup1695749386779 {
	name = "InstanceAccountDomainCleanup1695749386779";
	async up(queryRunner) {
		await queryRunner.query(`ALTER TABLE "instance" DROP COLUMN IF EXISTS "accountDomain"`);
		await queryRunner.query(`ALTER TABLE "instance" DROP COLUMN IF EXISTS "account_domain"`);
	}

	async down(queryRunner) {
		// This migration is only here to ensure consistent state if upgrading from certain dev branch commits, skipping the final TypeORM migration.
		// As such, there is no need to revert it.
	}
}
