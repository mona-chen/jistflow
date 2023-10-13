import { MigrationInterface, QueryRunner } from "typeorm";
export class ProxyRemoteFiles1576869585998 implements MigrationInterface {
	constructor() {
		this.name = "ProxyRemoteFiles1576869585998";
	}
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "meta" ADD "proxyRemoteFiles" boolean NOT NULL DEFAULT false`,
			undefined,
		);
	}
	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "meta" DROP COLUMN "proxyRemoteFiles"`,
			undefined,
		);
	}
}
