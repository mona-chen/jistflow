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
} as Record<string, (query: SelectQueryBuilder<any>, search: string, id: number) => any>

//TODO: editing the query should be possible, clicking search again resets it (it should be a twitter-like top of the page kind of deal)
//TODO: new filters are missing from the filter dropdown, and said dropdown should always show (remove the searchFilters meta prop), also we should fix the null bug

export function generateFtsQuery(query: SelectQueryBuilder<any>, q: string): void {
    const components = q.split(" ");
    const terms: string[] = [];
    let finalTerms: string[] = [];
    let counter = 0;

    for (const component of components) {
        const split = component.split(":");
        if (split.length > 1 && filters[split[0]] !== undefined)
            filters[split[0]](query, split.slice(1).join(":"), counter++);
        else terms.push(component);
    }

    let idx = 0;
    let state: 'idle' | 'quote' | 'parenthesis' = 'idle';
    for (let i = 0; i < terms.length; i++) {
        if (state === 'idle') {
            if (terms[i].startsWith('"')) {
                idx = i;
                state = 'quote';
            } else if (terms[i].startsWith('(')) {
                idx = i;
                state = 'parenthesis';
            }
            else {
                finalTerms.push(terms[i]);
            }
        }
        else if (state === 'quote' && terms[i].endsWith('"')) {
            finalTerms.push(extractToken(terms, idx, i));
            state = 'idle';
        } else if (state === 'parenthesis' && terms[i].endsWith(')')) {
            query.andWhere(new Brackets(qb => {
                for (const term of extractToken(terms, idx, i).split(' OR ')) {
                    const id = counter++;
                    qb.orWhere(`note.text ILIKE :q_${id}`);
                    query.setParameter(`q_${id}`, `%${sqlLikeEscape(term)}%`);
                }
            }));
            state = 'idle';
        }
    }

    if (state != "idle") {
        finalTerms.push(...extractToken(terms, idx, terms.length - 1, false).substring(1).split(' '));
    }

    for (const term of finalTerms) {
        const id = counter++;
        if (term.startsWith('-')) query.andWhere(`note.text NOT ILIKE :q_${id}`);
        else query.andWhere(`note.text ILIKE :q_${id}`);

        query.setParameter(`q_${id}`, `%${sqlLikeEscape(term.substring(term.startsWith('-') ? 1 : 0))}%`);
    }
}

function fromFilter(query: SelectQueryBuilder<any>, filter: string, id: number) {
    const userQuery = generateUserSubquery(filter, id);
    query.andWhere(`note.userId = (${userQuery.getQuery()})`);
    query.setParameters(userQuery.getParameters());
}

function fromFilterInverse(query: SelectQueryBuilder<any>, filter: string, id: number) {
    const userQuery = generateUserSubquery(filter, id);
    query.andWhere(`note.userId <> (${userQuery.getQuery()})`);
    query.setParameters(userQuery.getParameters());
}

function mentionFilter(query: SelectQueryBuilder<any>, filter: string, id: number) {
    const userQuery = generateUserSubquery(filter, id);
    query.andWhere(`note.mentions @> array[(${userQuery.getQuery()})]`);
    query.setParameters(userQuery.getParameters());
}

function mentionFilterInverse(query: SelectQueryBuilder<any>, filter: string, id: number) {
    const userQuery = generateUserSubquery(filter, id);
    query.andWhere(`NOT (note.mentions @> array[(${userQuery.getQuery()})])`);
    query.setParameters(userQuery.getParameters());
}

function replyFilter(query: SelectQueryBuilder<any>, filter: string, id: number) {
    const userQuery = generateUserSubquery(filter, id);
    query.andWhere(`note.replyUserId = (${userQuery.getQuery()})`);
    query.setParameters(userQuery.getParameters());
}

function replyFilterInverse(query: SelectQueryBuilder<any>, filter: string, id: number) {
    const userQuery = generateUserSubquery(filter, id);
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

function generateUserSubquery(filter: string, id: number) {
    if (filter.startsWith('@')) filter = filter.substring(1);
    const split = filter.split('@');

    const query = Users.createQueryBuilder('user')
        .select('user.id')
        .where(`user.usernameLower = :user_${id}`)
        .andWhere(`user.host ${split[1] !== undefined ? `= :host_${id}` : 'IS NULL'}`);

    query.setParameter(`user_${id}`, split[0].toLowerCase());

    if (split[1] !== undefined)
        query.setParameter(`host_${id}`, split[1].toLowerCase());

    return query;
}

function extractToken(array: string[], start: number, end: number, trim: boolean = true) {
    const slice = array.slice(start, end+1).join(" ");
    return trim ? trimStartAndEnd(slice) : slice;
}

function trimStartAndEnd(str: string) {
    return str.substring(1, str.length - 1);
}
