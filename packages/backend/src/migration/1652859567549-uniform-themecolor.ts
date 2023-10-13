import { MigrationInterface, QueryRunner } from "typeorm";
import tinycolor from "tinycolor2";

export class uniformThemecolor1652859567549 implements MigrationInterface {
	name = "uniformThemecolor1652859567549";

	async up(queryRunner: QueryRunner): Promise<void> {
		const formatColor = (color) => {
			let tc = new tinycolor(color);
			if (tc.isValid()) {
				return tc.toHexString();
			} else {
				return null;
			}
		};

		await queryRunner
			.query(
				'SELECT "id", "themeColor" FROM "instance" WHERE "themeColor" IS NOT NULL',
			)
			.then((instances) =>
				Promise.all(
					instances.map((instance) => {
						// update theme color to uniform format, e.g. #00ff00
						// invalid theme colors get set to null
						return queryRunner.query(
							'UPDATE "instance" SET "themeColor" = $1 WHERE "id" = $2',
							[formatColor(instance.themeColor), instance.id],
						);
					}),
				),
			);

		// also fix own theme color
		await queryRunner
			.query(
				'SELECT "themeColor" FROM "meta" WHERE "themeColor" IS NOT NULL LIMIT 1',
			)
			.then((metas) => {
				if (metas.length > 0) {
					return queryRunner.query('UPDATE "meta" SET "themeColor" = $1', [
						formatColor(metas[0].themeColor),
					]);
				}
			});
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		// The original representation is not stored, so migrating back is not possible.
		// The new format also works in older versions so this is not a problem.
	}
}
