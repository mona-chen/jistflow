// This migration is currently inactive.
// It will be activated in the next stable release after the first one that includes this file,
// to make sure users have enough time to migrate their unfollowed list members to follows.

/*
import { MigrationInterface, QueryRunner } from "typeorm"

export class RemoveUnfollowedUsersFromLists1697730891701 implements MigrationInterface {
    name = "RemoveUnfollowedUsersFromLists1697730891701";
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "user_list_joining" USING "user_list_joining" AS "member" INNER JOIN "user_list" "list" ON "member"."userListId" = "list"."id" WHERE "user_list_joining"."id" = "member"."id" AND "member"."userId" <> "list"."userId" AND "member"."userId" NOT IN (SELECT "followeeId" FROM "following" WHERE "following"."followerId" = "list"."userId")`);
    }

    public async down(_queryRunner: QueryRunner): Promise<void> {}
}
 */