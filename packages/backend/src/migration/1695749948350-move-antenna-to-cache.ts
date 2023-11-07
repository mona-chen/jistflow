import { MigrationInterface, QueryRunner } from "typeorm";

export class MoveAntennaToCache1695749948350 implements MigrationInterface {
	name = "MoveAntennaToCache1695749948350";
	async up(queryRunner: QueryRunner): Promise<void> {
		const tableExists = await queryRunner.query(`SELECT EXISTS ( SELECT 1 FROM pg_tables WHERE tablename = 'antenna_note' ) AS table_existence`)
			.then(p => !!p[0]['table_existence']);

		if (!tableExists) {
			console.log('Skipping migration ("antenna_note" table does not exist)');
			return;
		}

		const skipCopy = process.env.ANTENNA_MIGRATION_SKIP === 'true';
		let readLimit = parseInt(process.env.ANTENNA_MIGRATION_READ_LIMIT ?? "10000", 10) ?? 10000;

		if (skipCopy) {
			console.log('ANTENNA_MIGRATION_SKIP = true, skipping antenna note migration');
		}
		else {
			const { redisClient } = await import("../db/redis.js");
			const total = await queryRunner.query(`SELECT COUNT(1) FROM "antenna_note"`)
				.then(p => p[0]['count']);

			console.log(`Copying ${total} entries in "antenna_note", please hang tight!`);

			let remaining = total;

			let query = `SELECT "id", "noteId", "antennaId" FROM "antenna_note" ORDER BY "id" ASC LIMIT ${readLimit}`;

			while (remaining > 0) {
				let res = await queryRunner.query(query);
				if (res.length === 0) break;
				remaining -= res.length;

				for (const hit of res) {
					redisClient.xadd(`antennaTimeline:${hit.antennaId}`, "MAXLEN", "~", "200", "*", "note", hit.noteId);
				}

				console.log(`Copied ${total-remaining}/${total} notes to cache.`);

				query = `SELECT "id", "noteId", "antennaId" FROM "antenna_note" WHERE "id" > '${res.at(-1).id}' ORDER BY "id" ASC LIMIT ${Math.min(readLimit, remaining)}`;
			}

			redisClient.quit();
		}

		await queryRunner.query(`DROP TABLE IF EXISTS "antenna_note"`);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE IF NOT EXISTS "antenna_note" ("id" character varying(32) NOT NULL, "noteId" character varying(32) NOT NULL, "antennaId" character varying(32) NOT NULL, CONSTRAINT "PK_fb28d94d0989a3872df19fd6ef8" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_bd0397be22147e17210940e125" ON "antenna_note" ("noteId") `,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_0d775946662d2575dfd2068a5f" ON "antenna_note" ("antennaId") `,
		);
		await queryRunner.query(
			`CREATE UNIQUE INDEX "IDX_335a0bf3f904406f9ef3dd51c2" ON "antenna_note" ("noteId", "antennaId") `,
		);
		await queryRunner.query(
			`ALTER TABLE "antenna_note" ADD CONSTRAINT "FK_bd0397be22147e17210940e125b" FOREIGN KEY ("noteId") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
			undefined,
		);
		await queryRunner.query(
			`ALTER TABLE "antenna_note" ADD CONSTRAINT "FK_0d775946662d2575dfd2068a5f5" FOREIGN KEY ("antennaId") REFERENCES "antenna"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
			undefined,
		);
		await queryRunner.query(
			`ALTER TABLE "antenna_note" ADD "read" boolean NOT NULL DEFAULT false`,
			undefined,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_9937ea48d7ae97ffb4f3f063a4" ON "antenna_note" ("read") `,
			undefined,
		);
		await queryRunner.query(
			`COMMENT ON COLUMN "antenna_note"."noteId" IS 'The note ID.'`,
		);
		await queryRunner.query(
			`COMMENT ON COLUMN "antenna_note"."antennaId" IS 'The antenna ID.'`,
		);
	}
}
