import { Brackets, IsNull, Not, SelectQueryBuilder } from "typeorm";
import { sqlLikeEscape } from "@/misc/sql-like-escape.js";
import { Followings, Users } from "@/models/index.js";
import { FILE_TYPE_BROWSERSAFE } from "@/const.js";

const filters = {
    "from": fromFilter,
    "-from": fromFilterInverse,
    "mention": mentionFilter,
    "-mention": mentionFilterInverse,
    "reply": replyFilter,
    "-reply": replyFilterInverse,
    "replyto": replyFilter,
    "-replyto": replyFilterInverse,
    "to": replyFilter,
    "-to": replyFilterInverse,
    "before": beforeFilter,
    "until": beforeFilter,
    "after": afterFilter,
    "since": afterFilter,
    "domain": domainFilter,
    "host": domainFilter,
    "filter": miscFilter,
    "-filter": miscFilterInverse,
    "has": attachmentFilter,
} as Record<string, (query: SelectQueryBuilder<any>, search: string) => any>

//TODO: (phrase OR phrase2) should be treated as an OR part of the query
//TODO: "phrase with multiple words" should be treated as one term
//TODO: editing the query should be possible, clicking search again resets it (it should be a twitter-like top of the page kind of deal)

export function generateFtsQuery(query: SelectQueryBuilder<any>, q: string): void {
    const components = q.split(" ");
    const terms: string[] = [];

    for (const component of components) {
        const split = component.split(":");
        if (split.length > 1 && filters[split[0]] !== undefined)
            filters[split[0]](query, split.slice(1).join(":"));
        else terms.push(component);
    }

    for (const term of terms) {
        if (term.startsWith('-')) query.andWhere("note.text NOT ILIKE :q", { q: `%${sqlLikeEscape(term.substring(1))}%` });
        else query.andWhere("note.text ILIKE :q", { q: `%${sqlLikeEscape(term)}%` });
    }
}

function fromFilter(query: SelectQueryBuilder<any>, filter: string) {
    const userQuery = generateUserSubquery(filter);
    query.andWhere(`note.userId = (${userQuery.getQuery()})`);
    query.setParameters(userQuery.getParameters());
}

function fromFilterInverse(query: SelectQueryBuilder<any>, filter: string) {
    const userQuery = generateUserSubquery(filter);
    query.andWhere(`note.userId <> (${userQuery.getQuery()})`);
    query.setParameters(userQuery.getParameters());
}

function mentionFilter(query: SelectQueryBuilder<any>, filter: string) {
    const userQuery = generateUserSubquery(filter);
    query.andWhere(`note.mentions @> array[(${userQuery.getQuery()})]`);
    query.setParameters(userQuery.getParameters());
}

function mentionFilterInverse(query: SelectQueryBuilder<any>, filter: string) {
    const userQuery = generateUserSubquery(filter);
    query.andWhere(`NOT (note.mentions @> array[(${userQuery.getQuery()})])`);
    query.setParameters(userQuery.getParameters());
}

function replyFilter(query: SelectQueryBuilder<any>, filter: string) {
    const userQuery = generateUserSubquery(filter);
    query.andWhere(`note.replyUserId = (${userQuery.getQuery()})`);
    query.setParameters(userQuery.getParameters());
}

function replyFilterInverse(query: SelectQueryBuilder<any>, filter: string) {
    const userQuery = generateUserSubquery(filter);
    query.andWhere(`note.replyUserId <> (${userQuery.getQuery()})`);
    query.setParameters(userQuery.getParameters());
}

function beforeFilter(query: SelectQueryBuilder<any>, filter: string) {
    query.andWhere('note.createdAt < :before', { before: filter });
}

function afterFilter(query: SelectQueryBuilder<any>, filter: string) {
    query.andWhere('note.createdAt > :after', { after: filter });
}

function domainFilter(query: SelectQueryBuilder<any>, filter: string) {
    query.andWhere('note.userHost = :domain', { domain: filter });
}

function miscFilter(query: SelectQueryBuilder<any>, filter: string) {
    let subQuery: SelectQueryBuilder<any> | null = null;
    if (filter === 'followers') {
        subQuery = Followings.createQueryBuilder('following')
            .select('following.followerId')
            .where('following.followeeId = :meId')
    } else if (filter === 'following') {
        subQuery = Followings.createQueryBuilder('following')
            .select('following.followeeId')
            .where('following.followerId = :meId')
    } else if (filter === 'replies') {
        query.andWhere('note.replyId IS NOT NULL');
    } else if (filter === 'boosts') {
        query.andWhere('note.renoteId IS NOT NULL');
    }

    if (subQuery !== null) query.andWhere(`note.userId IN (${subQuery.getQuery()})`);
}

function miscFilterInverse(query: SelectQueryBuilder<any>, filter: string) {
    let subQuery: SelectQueryBuilder<any> | null = null;
    if (filter === 'followers') {
        subQuery = Followings.createQueryBuilder('following')
            .select('following.followerId')
            .where('following.followeeId = :meId')
    } else if (filter === 'following') {
        subQuery = Followings.createQueryBuilder('following')
            .select('following.followeeId')
            .where('following.followerId = :meId')
    } else if (filter === 'replies') {
        query.andWhere('note.replyId IS NULL');
    } else if (filter === 'boosts' || filter === 'renotes') {
        query.andWhere('note.renoteId IS NULL');
    }

    if (subQuery !== null) query.andWhere(`note.userId NOT IN (${subQuery.getQuery()})`);
}

function attachmentFilter(query: SelectQueryBuilder<any>, filter: string) {
    switch(filter) {
        case 'image':
        case 'video':
        case 'audio':
            query.andWhere(`note.attachedFileTypes && array[:...types]::varchar[]`, { types: FILE_TYPE_BROWSERSAFE.filter(t => t.startsWith(`${filter}/`)) });
            break;
        case 'file':
            query.andWhere(`note.attachedFileTypes <> '{}'`);
            query.andWhere(`NOT (note.attachedFileTypes && array[:...types]::varchar[])`, { types: FILE_TYPE_BROWSERSAFE });
            break;
        default:
            break;
    }
}

function generateUserSubquery(filter: string) {
    if (filter.startsWith('@')) filter = filter.substring(1);
    const split = filter.split('@');
    const id = Buffer.from(filter).toString('hex');

    const query = Users.createQueryBuilder('user')
        .select('user.id')
        .where(`user.usernameLower = :user_${id}`)
        .andWhere(`user.host ${split[1] !== undefined ? `= :host_${id}` : 'IS NULL'}`);

    query.setParameter(`user_${id}`, split[0].toLowerCase());

    if (split[1] !== undefined)
        query.setParameter(`host_${id}`, split[1].toLowerCase());

    return query;
}
