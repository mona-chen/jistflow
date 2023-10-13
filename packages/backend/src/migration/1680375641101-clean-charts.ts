import { MigrationInterface, QueryRunner } from "typeorm";
export class CleanCharts1680375641101 implements MigrationInterface {
	constructor() {
		this.name = "CleanCharts1680375641101";
	}
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`delete from __chart__hashtag where ___local_users = 0 and ___remote_users = 0;`,
		);
		await queryRunner.query(
			`delete from __chart_day__hashtag where ___local_users = 0 and ___remote_users = 0;`,
		);
		await queryRunner.query(`COMMIT;`);
		await queryRunner.query(`vacuum __chart__hashtag;`);
		await queryRunner.query(`vacuum __chart_day__hashtag;`);
		await queryRunner.query(`COMMIT;`);
	}
	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`delete from __chart__hashtag where ___local_users = 0 and ___remote_users = 0;`,
		);
		await queryRunner.query(
			`delete from __chart_day__hashtag where ___local_users = 0 and ___remote_users = 0;`,
		);
	}
}
