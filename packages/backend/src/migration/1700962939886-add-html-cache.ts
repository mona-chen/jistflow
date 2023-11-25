import { MigrationInterface, QueryRunner } from "typeorm";

export class AddHtmlCache1700962939886 implements MigrationInterface {
    name = 'AddHtmlCache1700962939886'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "html_note_cache_entry" ("noteId" character varying(32) NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE, "content" text, CONSTRAINT "PK_6ef86ec901b2017cbe82d3a8286" PRIMARY KEY ("noteId"))`);
        await queryRunner.query(`CREATE TABLE "html_user_cache_entry" ("userId" character varying(32) NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE, "bio" text, "fields" jsonb NOT NULL DEFAULT '[]', CONSTRAINT "PK_920b9474e3c9cae3f3c37c057e1" PRIMARY KEY ("userId"))`);
        await queryRunner.query(`ALTER TABLE "html_note_cache_entry" ADD CONSTRAINT "FK_6ef86ec901b2017cbe82d3a8286" FOREIGN KEY ("noteId") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "html_user_cache_entry" ADD CONSTRAINT "FK_920b9474e3c9cae3f3c37c057e1" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "html_user_cache_entry" DROP CONSTRAINT "FK_920b9474e3c9cae3f3c37c057e1"`);
        await queryRunner.query(`ALTER TABLE "html_note_cache_entry" DROP CONSTRAINT "FK_6ef86ec901b2017cbe82d3a8286"`);
        await queryRunner.query(`DROP TABLE "html_user_cache_entry"`);
        await queryRunner.query(`DROP TABLE "html_note_cache_entry"`);
    }

}
