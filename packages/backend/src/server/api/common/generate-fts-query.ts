import { Brackets, SelectQueryBuilder, WhereExpressionBuilder } from "typeorm";
import { sqlLikeEscape } from "@/misc/sql-like-escape.js";
import { sqlRegexEscape } from "@/misc/sql-regex-escape.js";
import { Followings, NoteFavorites, NoteReactions, Users } from "@/models/index.js";

const filters = {
    "from": fromFilter,
    "-from": fromFilterInverse,
    "mention": mentionFilter,
    "-mention": mentionFilterInverse,
    "reply": replyFilter,
    "-reply": replyFilterInverse,
    "to": replyFilter,
    "-to": replyFilterInverse,
    "before": beforeFilter,
    "until": beforeFilter,
    "after": afterFilter,
    "since": afterFilter,
    "instance": instanceFilter,
    "-instance": instanceFilterInverse,
    "domain": instanceFilter,
    "-domain": instanceFilterInverse,
    "host": instanceFilter,
    "-host": instanceFilterInverse,
    "filter": miscFilter,
    "-filter": miscFilterInverse,
    "in": inFilter,
    "-in": inFilterInverse,
    "has": attachmentFilter,
} as Record<string, (query: SelectQueryBuilder<any>, search: string, id: number) => any>

export function generateFtsQuery(query: SelectQueryBuilder<any>, q: string): void {
    const components = q.trim().split(" ");
    const terms: string[] = [];
    let finalTerms: string[] = [];
    let counter = 0;
    let caseSensitive = false;
    let matchWords = false;

    for (const component of components) {
        const split = component.split(":");
        if (split.length > 1 && filters[split[0]] !== undefined)
            filters[split[0]](query, split.slice(1).join(":"), counter++);
        else if(split.length > 1 && (split[0] === "search" || split[0] === "match"))
            matchWords = split[1] === 'word' || split[1] === 'words';
        else if(split.length > 1 && split[0] === "case")
            caseSensitive = split[1] === 'sensitive';
        else terms.push(component);
    }

    let idx = 0;
    let state: 'idle' | 'quote' | 'parenthesis' = 'idle';
    for (let i = 0; i < terms.length; i++) {
        if (state === 'idle') {
            if ((terms[i].startsWith('"') && terms[i].endsWith('"')) || (terms[i].startsWith('(') && terms[i].endsWith(')'))) {
                finalTerms.push(trimStartAndEnd(terms[i]));
            } else if (terms[i].startsWith('"')) {
                idx = i;
                state = 'quote';
            } else if (terms[i].startsWith('(')) {
                idx = i;
                state = 'parenthesis';
            } else {
                finalTerms.push(terms[i]);
            }
        } else if (state === 'quote' && terms[i].endsWith('"')) {
            finalTerms.push(extractToken(terms, idx, i));
            state = 'idle';
        } else if (state === 'parenthesis' && terms[i].endsWith(')')) {
            query.andWhere(new Brackets(qb => {
                for (const term of extractToken(terms, idx, i).split(' OR ')) {
                    const id = counter++;
                    appendSearchQuery(term, 'or', query, qb, id, term.startsWith('-'), matchWords, caseSensitive);
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
        appendSearchQuery(term, 'and', query, query, id, term.startsWith('-'), matchWords, caseSensitive);
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
	query.addCommonTableExpression(userQuery.getQuery(), `cte_${id}`, { materialized: true })
    query.andWhere(`note.mentions @> array[(SELECT * FROM cte_${id})]::varchar[]`);
	query.setParameters(userQuery.getParameters());
}

function mentionFilterInverse(query: SelectQueryBuilder<any>, filter: string, id: number) {
    const userQuery = generateUserSubquery(filter, id);
	query.addCommonTableExpression(userQuery.getQuery(), `cte_${id}`, { materialized: true })
	query.andWhere(`NOT (note.mentions @> array[(SELECT * FROM cte_${id})]::varchar[])`);
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

function instanceFilter(query: SelectQueryBuilder<any>, filter: string, id: number) {
    if (filter === 'local') {
        query.andWhere(`note.userHost IS NULL`);
    } else {
        query.andWhere(`note.userHost = :instance_${id}`);
        query.setParameter(`instance_${id}`, filter);
    }
}

function instanceFilterInverse(query: SelectQueryBuilder<any>, filter: string, id: number) {
    if (filter === 'local') {
        query.andWhere(`note.userHost IS NOT NULL`);
    } else {
        query.andWhere(`note.userHost <> :instance_${id}`);
        query.setParameter(`instance_${id}`, filter);
    }
}

function miscFilter(query: SelectQueryBuilder<any>, filter: string) {
    let subQuery: SelectQueryBuilder<any> | null = null;
    if (filter === 'followers') {
        subQuery = Followings.createQueryBuilder('following')
            .select('following.followerId')
            .where('following.followeeId = :meId');
    } else if (filter === 'following') {
        subQuery = Followings.createQueryBuilder('following')
            .select('following.followeeId')
            .where('following.followerId = :meId');
    } else if (filter === 'replies' || filter === 'reply') {
        query.andWhere('note.replyId IS NOT NULL');
    } else if (filter === 'boosts' || filter === 'boost' || filter === 'renotes' || filter === 'renote') {
        query.andWhere('note.renoteId IS NOT NULL');
    }

    if (subQuery !== null) query.andWhere(`note.userId IN (${subQuery.getQuery()})`);
}

function miscFilterInverse(query: SelectQueryBuilder<any>, filter: string) {
    let subQuery: SelectQueryBuilder<any> | null = null;
    if (filter === 'followers') {
        subQuery = Followings.createQueryBuilder('following')
            .select('following.followerId')
            .where('following.followeeId = :meId');
    } else if (filter === 'following') {
        subQuery = Followings.createQueryBuilder('following')
            .select('following.followeeId')
            .where('following.followerId = :meId');
    } else if (filter === 'replies' || filter === 'reply') {
        query.andWhere('note.replyId IS NULL');
	} else if (filter === 'boosts' || filter === 'boost' || filter === 'renotes' || filter === 'renote') {
        query.andWhere('note.renoteId IS NULL');
    }

    if (subQuery !== null) query.andWhere(`note.userId NOT IN (${subQuery.getQuery()})`);
}

function inFilter(query: SelectQueryBuilder<any>, filter: string) {
    let subQuery: SelectQueryBuilder<any> | null = null;
    if (filter === 'bookmarks') {
        subQuery = NoteFavorites.createQueryBuilder('bookmark')
            .select('bookmark.noteId')
            .where('bookmark.userId = :meId');
    } else if (filter === 'favorites' || filter === 'favourites' || filter === 'reactions' || filter === 'likes') {
        subQuery = NoteReactions.createQueryBuilder('react')
            .select('react.noteId')
            .where('react.userId = :meId');
    }

    if (subQuery !== null) query.andWhere(`note.id IN (${subQuery.getQuery()})`);
}

function inFilterInverse(query: SelectQueryBuilder<any>, filter: string) {
    let subQuery: SelectQueryBuilder<any> | null = null;
    if (filter === 'bookmarks') {
        subQuery = NoteFavorites.createQueryBuilder('bookmark')
            .select('bookmark.noteId')
            .where('bookmark.userId = :meId');
    } else if (filter === 'favorites' || filter === 'favourites' || filter === 'reactions' || filter === 'likes') {
        subQuery = NoteReactions.createQueryBuilder('react')
            .select('react.noteId')
            .where('react.userId = :meId');
    }

    if (subQuery !== null) query.andWhere(`note.id NOT IN (${subQuery.getQuery()})`);
}

function attachmentFilter(query: SelectQueryBuilder<any>, filter: string) {
    switch(filter) {
        case 'image':
            query.andWhere(`note."attachedFileTypes"::varchar ILIKE '%image/%'`);
            break;
        case 'video':
            query.andWhere(`note."attachedFileTypes"::varchar ILIKE '%video/%'`);
            break;
        case 'audio':
            query.andWhere(`note."attachedFileTypes"::varchar ILIKE '%audio/%'`);
            break;
        case 'file':
            query.andWhere(`note."attachedFileTypes" <> '{}'`);
			query.andWhere(`NOT (note."attachedFileTypes"::varchar ILIKE '%image/%')`);
			query.andWhere(`NOT (note."attachedFileTypes"::varchar ILIKE '%video/%')`);
			query.andWhere(`NOT (note."attachedFileTypes"::varchar ILIKE '%audio/%')`);
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

function appendSearchQuery(term: string, mode: 'and' | 'or', query: SelectQueryBuilder<any>, qb: SelectQueryBuilder<any> | WhereExpressionBuilder, id: number, negate: boolean, matchWords: boolean, caseSensitive: boolean) {
    const sql = `note.text ${getSearchMatchOperator(negate, matchWords, caseSensitive)} :q_${id}`;
    if (mode === 'and') qb.andWhere(sql);
    else if (mode === 'or') qb.orWhere(sql);
    query.setParameter(`q_${id}`, escapeSqlSearchParam(term.substring(negate ? 1 : 0), matchWords));
}

function getSearchMatchOperator(negate: boolean, matchWords: boolean, caseSensitive: boolean) {
    return `${negate ? 'NOT ' : ''}${matchWords ? caseSensitive ? '~' : '~*' : caseSensitive ? 'LIKE' : 'ILIKE'}`;
}

function escapeSqlSearchParam(param: string, matchWords: boolean) {
    return matchWords ? `\\y${sqlRegexEscape(param)}\\y` : `%${sqlLikeEscape(param)}%`;
}
