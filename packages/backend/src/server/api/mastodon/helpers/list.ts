import { ILocalUser, User } from "@/models/entities/user.js";
import { Blockings, UserListJoinings, UserLists, Users } from "@/models/index.js";
import { LinkPaginationObject } from "@/server/api/mastodon/helpers/user.js";
import { PaginationHelpers } from "@/server/api/mastodon/helpers/pagination.js";
import { UserList } from "@/models/entities/user-list.js";
import { pushUserToUserList } from "@/services/user-list/push.js";
import { genId } from "@/misc/gen-id.js";
import { publishUserListStream } from "@/services/stream.js";
import { MastoApiError } from "@/server/api/mastodon/middleware/catch-errors.js";

export class ListHelpers {
    public static async getLists(user: ILocalUser): Promise<MastodonEntity.List[]> {
        return UserLists.findBy({ userId: user.id }).then(p => p.map(list => {
            return {
                id: list.id,
                title: list.name
            }
        }));
    }

    public static async getList(user: ILocalUser, id: string): Promise<MastodonEntity.List> {
        return UserLists.findOneByOrFail({ userId: user.id, id: id }).then(list => {
            return {
                id: list.id,
                title: list.name
            }
        });
    }

    public static async getListOr404(user: ILocalUser, id: string): Promise<MastodonEntity.List> {
        return this.getList(user, id).catch(_ => {
            throw new MastoApiError(404);
        })
    }

    public static async getListUsers(user: ILocalUser, id: string, maxId: string | undefined, sinceId: string | undefined, minId: string | undefined, limit: number = 40): Promise<LinkPaginationObject<User[]>> {
        if (limit > 80) limit = 80;
        const list = await UserLists.findOneBy({ userId: user.id, id: id });
        if (!list) throw new MastoApiError(404);
        const query = PaginationHelpers.makePaginationQuery(
            UserListJoinings.createQueryBuilder('member'),
            sinceId,
            maxId,
            minId
        )
            .andWhere("member.userListId = :listId", { listId: list.id })
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

    public static async addToList(localUser: ILocalUser, list: UserList, usersToAdd: User[]) {
        if (localUser.id != list.userId) throw new Error("List is not owned by user");
        for (const user of usersToAdd) {
            if (user.id !== localUser.id) {
                const isBlocked = await Blockings.exist({
                    where: {
                        blockerId: user.id,
                        blockeeId: localUser.id,
                    },
                });
                if (isBlocked) throw Error("Can't add users you've been blocked by to list");
            }

            const exist = await UserListJoinings.exist({
                where: {
                    userListId: list.id,
                    userId: user.id,
                },
            });

            if (exist) continue;
            await pushUserToUserList(user, list);
        }
    }

    public static async removeFromList(localUser: ILocalUser, list: UserList, usersToRemove: User[]) {
        if (localUser.id != list.userId) throw new Error("List is not owned by user");
        for (const user of usersToRemove) {
            const exist = await UserListJoinings.exist({
                where: {
                    userListId: list.id,
                    userId: user.id,
                },
            });

            if (!exist) continue;
            await UserListJoinings.delete({ userListId: list.id, userId: user.id });
            publishUserListStream(list.id, "userRemoved", await Users.pack(user));
        }
    }

    public static async createList(user: ILocalUser, title: string): Promise<MastodonEntity.List> {
        if (title.length < 1) throw new MastoApiError(400, "Title must not be empty");

        const list = await UserLists.insert({
            id: genId(),
            createdAt: new Date(),
            userId: user.id,
            name: title,
        }).then(async res => await UserLists.findOneByOrFail(res.identifiers[0]));

        return {
            id: list.id,
            title: list.name
        };
    }

    public static async updateList(user: ILocalUser, list: UserList, title: string) {
        if (title.length < 1) throw new MastoApiError(400, "Title must not be empty");
        if (user.id != list.userId) throw new Error("List is not owned by user");

        const partial = { name: title };
        const result = await UserLists.update(list.id, partial)
            .then(async _ => await UserLists.findOneByOrFail({ id: list.id }));

        return {
            id: result.id,
            title: result.name
        };
    }

    public static async getListsByMember(user: ILocalUser, member: User): Promise<MastodonEntity.List[]> {
        const joinQuery = UserListJoinings.createQueryBuilder('member')
            .select("member.userListId")
            .where("member.userId = :memberId");
        const query = UserLists.createQueryBuilder('list')
            .where("list.userId = :userId", { userId: user.id })
            .andWhere(`list.id IN (${joinQuery.getQuery()})`)
            .setParameters({ memberId: member.id });

        return query.getMany()
            .then(results => results.map(result => {
                return {
                    id: result.id,
                    title: result.name
                }
            }));
    }
}
