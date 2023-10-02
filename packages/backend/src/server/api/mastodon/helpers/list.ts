import { ILocalUser, User } from "@/models/entities/user.js";
import { UserListJoinings, UserLists } from "@/models/index.js";
import { LinkPaginationObject } from "@/server/api/mastodon/helpers/user.js";
import { PaginationHelpers } from "@/server/api/mastodon/helpers/pagination.js";
import { UserList } from "@/models/entities/user-list.js";

export class ListHelpers {
    public static async getLists(user: ILocalUser): Promise<MastodonEntity.List[]> {
        return UserLists.findBy({userId: user.id}).then(p => p.map(list => {
            return {
                id: list.id,
                title: list.name
            }
        }));
    }

    public static async getList(user: ILocalUser, id: string): Promise<MastodonEntity.List> {
        return UserLists.findOneByOrFail({userId: user.id, id: id}).then(list => {
            return {
                id: list.id,
                title: list.name
            }
        });
    }

    public static async getListUsers(user: ILocalUser, id: string, maxId: string | undefined, sinceId: string | undefined, minId: string | undefined, limit: number = 40): Promise<LinkPaginationObject<User[]>> {
        if (limit > 80) limit = 80;
        const list = await UserLists.findOneByOrFail({userId: user.id, id: id});
        const query = PaginationHelpers.makePaginationQuery(
            UserListJoinings.createQueryBuilder('member'),
            sinceId,
            maxId,
            minId
        )
            .andWhere("member.userListId = :listId", {listId: list.id})
            .innerJoinAndSelect("member.user", "user");

        return query.take(limit).getMany().then(async p => {
            if (minId !== undefined) p = p.reverse();
            const users = p
                .map(p => p.user)
                .filter(p => p) as User[];

            return {
                data: users,
                maxId: p.map(p => p.id).at(-1),
                minId: p.map(p => p.id)[0],
            };
        });
    }

    public static async deleteList(user: ILocalUser, list: UserList) {
        if (user.id != list.userId) throw new Error("List is not owned by user");
        await UserLists.delete(list.id);
    }
}
