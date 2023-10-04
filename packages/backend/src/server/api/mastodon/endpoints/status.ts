import Router from "@koa/router";
import { convertId, IdType } from "../../index.js";
import { convertAccount, convertPoll, convertStatus, convertStatusEdit, convertStatusSource, } from "../converters.js";
import { NoteConverter } from "@/server/api/mastodon/converters/note.js";
import { getNote } from "@/server/api/common/getters.js";
import authenticate from "@/server/api/authenticate.js";
import { NoteHelpers } from "@/server/api/mastodon/helpers/note.js";
import { UserHelpers } from "@/server/api/mastodon/helpers/user.js";
import { convertPaginationArgsIds, limitToInt, normalizeUrlQuery } from "@/server/api/mastodon/endpoints/timeline.js";
import { PaginationHelpers } from "@/server/api/mastodon/helpers/pagination.js";
import { UserConverter } from "@/server/api/mastodon/converters/user.js";
import { Cache } from "@/misc/cache.js";
import AsyncLock from "async-lock";
import { ILocalUser } from "@/models/entities/user.js";
import { PollHelpers } from "@/server/api/mastodon/helpers/poll.js";
import { toArray } from "@/prelude/array.js";

const postIdempotencyCache = new Cache<{ status?: MastodonEntity.Status }>('postIdempotencyCache', 60 * 60);
const postIdempotencyLocks = new AsyncLock();

export function setupEndpointsStatus(router: Router): void {
    router.post("/v1/statuses", async (ctx) => {
        try {
            const auth = await authenticate(ctx.headers.authorization, null);
            const user = auth[0] ?? null;

            if (!user) {
                ctx.status = 401;
                return;
            }

            const key = getIdempotencyKey(ctx.headers, user);
            if (key !== null) {
                const result = await getFromIdempotencyCache(key);

                if (result) {
                    ctx.body = result;
                    return;
                }
            }

            let request = NoteHelpers.normalizeComposeOptions(ctx.request.body);
            ctx.body = await NoteHelpers.createNote(request, user)
                .then(p => NoteConverter.encode(p, user))
                .then(p => convertStatus(p));

            if (key !== null) postIdempotencyCache.set(key, {status: ctx.body});
        } catch (e: any) {
            console.error(e);
            ctx.status = 500;
            ctx.body = {error: e.message};
        }
    });
    router.put("/v1/statuses/:id", async (ctx) => {
        try {
            const auth = await authenticate(ctx.headers.authorization, null);
            const user = auth[0] ?? null;

            if (!user) {
                ctx.status = 401;
                return;
            }

            const noteId = convertId(ctx.params.id, IdType.IceshrimpId);
            const note = await getNote(noteId, user ?? null).then(n => n).catch(() => null);
            if (!note) {
                if (!note) {
                    ctx.status = 404;
                    ctx.body = {
                        error: "Note not found"
                    };
                    return;
                }
            }

            let request = NoteHelpers.normalizeEditOptions(ctx.request.body);
            ctx.body = await NoteHelpers.editNote(request, note, user)
                .then(p => NoteConverter.encode(p, user))
                .then(p => convertStatus(p));
        } catch (e: any) {
            console.error(e);
            ctx.status = ctx.status == 404 ? 404 : 401;
            ctx.body = e.response.data;
        }
    });
    router.get<{ Params: { id: string } }>("/v1/statuses/:id", async (ctx) => {
        try {
            const auth = await authenticate(ctx.headers.authorization, null);
            const user = auth[0] ?? null;

            const noteId = convertId(ctx.params.id, IdType.IceshrimpId);
            const note = await getNote(noteId, user ?? null).then(n => n).catch(() => null);

            if (!note) {
                ctx.status = 404;
                return;
            }

            const status = await NoteConverter.encode(note, user);
            ctx.body = convertStatus(status);
        } catch (e: any) {
            console.error(e);
            ctx.status = ctx.status == 404 ? 404 : 401;
            ctx.body = e.response.data;
        }
    });
    router.delete<{ Params: { id: string } }>("/v1/statuses/:id", async (ctx) => {
        try {
            const auth = await authenticate(ctx.headers.authorization, null);
            const user = auth[0] ?? null;

            if (!user) {
                ctx.status = 401;
                return;
            }

            const noteId = convertId(ctx.params.id, IdType.IceshrimpId);
            const note = await getNote(noteId, user ?? null).then(n => n).catch(() => null);

            if (!note) {
                ctx.status = 404;
                ctx.body = {
                    error: "Note not found"
                };
                return;
            }

            if (user.id !== note.userId) {
                ctx.status = 403;
                ctx.body = {
                    error: "Cannot delete someone else's note"
                };
                return;
            }

            ctx.body = await NoteHelpers.deleteNote(note, user)
                .then(p => convertStatus(p));
        } catch (e: any) {
            console.error(`Error processing ${ctx.method} /api${ctx.path}: ${e.message}`);
            ctx.status = 500;
            ctx.body = {
                error: e.message
            }
        }
    });

    router.get<{ Params: { id: string } }>(
        "/v1/statuses/:id/context",
        async (ctx) => {
            try {
                const auth = await authenticate(ctx.headers.authorization, null);
                const user = auth[0] ?? null;

                const id = convertId(ctx.params.id, IdType.IceshrimpId);
                const cache = UserHelpers.getFreshAccountCache();
                const note = await getNote(id, user ?? null).then(n => n).catch(() => null);
                if (!note) {
                    if (!note) {
                        ctx.status = 404;
                        return;
                    }
                }

                const ancestors = await NoteHelpers.getNoteAncestors(note, user, user ? 4096 : 60)
                    .then(n => NoteConverter.encodeMany(n, user, cache))
                    .then(n => n.map(s => convertStatus(s)));
                const descendants = await NoteHelpers.getNoteDescendants(note, user, user ? 4096 : 40, user ? 4096 : 20)
                    .then(n => NoteConverter.encodeMany(n, user, cache))
                    .then(n => n.map(s => convertStatus(s)));

                ctx.body = {
                    ancestors,
                    descendants,
                };
            } catch (e: any) {
                console.error(e);
                ctx.status = 401;
                ctx.body = e.response.data;
            }
        },
    );
    router.get<{ Params: { id: string } }>(
        "/v1/statuses/:id/history",
        async (ctx) => {
            try {
                const auth = await authenticate(ctx.headers.authorization, null);
                const user = auth[0] ?? null;

                const id = convertId(ctx.params.id, IdType.IceshrimpId);
                const note = await getNote(id, user).catch(_ => null);

                if (note === null) {
                    ctx.status = 404;
                    return;
                }

                const res = await NoteHelpers.getNoteEditHistory(note);
                ctx.body = res.map(p => convertStatusEdit(p));
            } catch (e: any) {
                console.error(e);
                ctx.status = 401;
                ctx.body = e.response.data;
            }
        },
    );
    router.get<{ Params: { id: string } }>(
        "/v1/statuses/:id/source",
        async (ctx) => {
            try {
                const auth = await authenticate(ctx.headers.authorization, null);
                const user = auth[0] ?? null;

                const id = convertId(ctx.params.id, IdType.IceshrimpId);
                const note = await getNote(id, user).catch(_ => null);

                if (note === null) {
                    ctx.status = 404;
                    return;
                }

                const src = NoteHelpers.getNoteSource(note);
                ctx.body = convertStatusSource(src);
            } catch (e: any) {
                console.error(e);
                ctx.status = 401;
                ctx.body = e.response.data;
            }
        },
    );
    router.get<{ Params: { id: string } }>(
        "/v1/statuses/:id/reblogged_by",
        async (ctx) => {
            try {
                const auth = await authenticate(ctx.headers.authorization, null);
                const user = auth[0] ?? null;

                const id = convertId(ctx.params.id, IdType.IceshrimpId);
                const note = await getNote(id, user).catch(_ => null);

                if (note === null) {
                    ctx.status = 404;
                    return;
                }

                const cache = UserHelpers.getFreshAccountCache();
                const args = normalizeUrlQuery(convertPaginationArgsIds(limitToInt(ctx.query as any)));
                const res = await NoteHelpers.getNoteRebloggedBy(note, user, args.max_id, args.since_id, args.min_id, args.limit);
                const users = await UserConverter.encodeMany(res.data, cache);
                ctx.body = users.map(m => convertAccount(m));
                PaginationHelpers.appendLinkPaginationHeader(args, ctx, res, 40);
            } catch (e: any) {
                console.error(e);
                ctx.status = 401;
                ctx.body = e.response.data;
            }
        },
    );
    router.get<{ Params: { id: string } }>(
        "/v1/statuses/:id/favourited_by",
        async (ctx) => {
            try {
                const auth = await authenticate(ctx.headers.authorization, null);
                const user = auth[0] ?? null;

                const id = convertId(ctx.params.id, IdType.IceshrimpId);
                const note = await getNote(id, user).catch(_ => null);

                if (note === null) {
                    ctx.status = 404;
                    return;
                }

                const cache = UserHelpers.getFreshAccountCache();
                const args = normalizeUrlQuery(convertPaginationArgsIds(limitToInt(ctx.query as any)));
                const res = await NoteHelpers.getNoteFavoritedBy(note, args.max_id, args.since_id, args.min_id, args.limit);
                const users = await UserConverter.encodeMany(res.data, cache);
                ctx.body = users.map(m => convertAccount(m));
                PaginationHelpers.appendLinkPaginationHeader(args, ctx, res, 40);
            } catch (e: any) {
                console.error(e);
                ctx.status = 401;
                ctx.body = e.response.data;
            }
        },
    );
    router.post<{ Params: { id: string } }>(
        "/v1/statuses/:id/favourite",
        async (ctx) => {
            try {
                const auth = await authenticate(ctx.headers.authorization, null);
                const user = auth[0] ?? null;

                if (!user) {
                    ctx.status = 401;
                    return;
                }

                const id = convertId(ctx.params.id, IdType.IceshrimpId);
                const note = await getNote(id, user).catch(_ => null);

                if (note === null) {
                    ctx.status = 404;
                    return;
                }

                const reaction = await NoteHelpers.getDefaultReaction().catch(_ => null);

                if (reaction === null) {
                    ctx.status = 500;
                    return;
                }

                ctx.body = await NoteHelpers.reactToNote(note, user, reaction)
                    .then(p => NoteConverter.encode(p, user))
                    .then(p => convertStatus(p));
            } catch (e: any) {
                console.error(e);
                console.error(e.response.data);
                ctx.status = 400;
                ctx.body = e.response.data;
            }
        },
    );
    router.post<{ Params: { id: string } }>(
        "/v1/statuses/:id/unfavourite",
        async (ctx) => {
            try {
                const auth = await authenticate(ctx.headers.authorization, null);
                const user = auth[0] ?? null;

                if (!user) {
                    ctx.status = 401;
                    return;
                }

                const id = convertId(ctx.params.id, IdType.IceshrimpId);
                const note = await getNote(id, user).catch(_ => null);

                if (note === null) {
                    ctx.status = 404;
                    return;
                }

                ctx.body = await NoteHelpers.removeReactFromNote(note, user)
                    .then(p => NoteConverter.encode(p, user))
                    .then(p => convertStatus(p));
            } catch (e: any) {
                console.error(e);
                ctx.status = 401;
                ctx.body = e.response.data;
            }
        },
    );

    router.post<{ Params: { id: string } }>(
        "/v1/statuses/:id/reblog",
        async (ctx) => {
            try {
                const auth = await authenticate(ctx.headers.authorization, null);
                const user = auth[0] ?? null;

                if (!user) {
                    ctx.status = 401;
                    return;
                }

                const id = convertId(ctx.params.id, IdType.IceshrimpId);
                const note = await getNote(id, user).catch(_ => null);

                if (note === null) {
                    ctx.status = 404;
                    return;
                }

                ctx.body = await NoteHelpers.reblogNote(note, user)
                    .then(p => NoteConverter.encode(p, user))
                    .then(p => convertStatus(p));
            } catch (e: any) {
                console.error(e);
                ctx.status = 401;
                ctx.body = e.response.data;
            }
        },
    );

    router.post<{ Params: { id: string } }>(
        "/v1/statuses/:id/unreblog",
        async (ctx) => {
            try {
                const auth = await authenticate(ctx.headers.authorization, null);
                const user = auth[0] ?? null;

                if (!user) {
                    ctx.status = 401;
                    return;
                }

                const id = convertId(ctx.params.id, IdType.IceshrimpId);
                const note = await getNote(id, user).catch(_ => null);

                if (note === null) {
                    ctx.status = 404;
                    return;
                }

                ctx.body = await NoteHelpers.unreblogNote(note, user)
                    .then(p => NoteConverter.encode(p, user))
                    .then(p => convertStatus(p));
            } catch (e: any) {
                console.error(e);
                ctx.status = 401;
                ctx.body = e.response.data;
            }
        },
    );

    router.post<{ Params: { id: string } }>(
        "/v1/statuses/:id/bookmark",
        async (ctx) => {
            try {
                const auth = await authenticate(ctx.headers.authorization, null);
                const user = auth[0] ?? null;

                if (!user) {
                    ctx.status = 401;
                    return;
                }

                const id = convertId(ctx.params.id, IdType.IceshrimpId);
                const note = await getNote(id, user).catch(_ => null);

                if (note === null) {
                    ctx.status = 404;
                    return;
                }

                ctx.body = await NoteHelpers.bookmarkNote(note, user)
                    .then(p => NoteConverter.encode(p, user))
                    .then(p => convertStatus(p));
            } catch (e: any) {
                console.error(e);
                ctx.status = 401;
                ctx.body = e.response.data;
            }
        },
    );

    router.post<{ Params: { id: string } }>(
        "/v1/statuses/:id/unbookmark",
        async (ctx) => {
            try {
                const auth = await authenticate(ctx.headers.authorization, null);
                const user = auth[0] ?? null;

                if (!user) {
                    ctx.status = 401;
                    return;
                }

                const id = convertId(ctx.params.id, IdType.IceshrimpId);
                const note = await getNote(id, user).catch(_ => null);

                if (note === null) {
                    ctx.status = 404;
                    return;
                }

                ctx.body = await NoteHelpers.unbookmarkNote(note, user)
                    .then(p => NoteConverter.encode(p, user))
                    .then(p => convertStatus(p));
            } catch (e: any) {
                console.error(e);
                ctx.status = 401;
                ctx.body = e.response.data;
            }
        },
    );

    router.post<{ Params: { id: string } }>(
        "/v1/statuses/:id/pin",
        async (ctx) => {
            try {
                const auth = await authenticate(ctx.headers.authorization, null);
                const user = auth[0] ?? null;

                if (!user) {
                    ctx.status = 401;
                    return;
                }

                const id = convertId(ctx.params.id, IdType.IceshrimpId);
                const note = await getNote(id, user).catch(_ => null);

                if (note === null) {
                    ctx.status = 404;
                    return;
                }

                ctx.body = await NoteHelpers.pinNote(note, user)
                    .then(p => NoteConverter.encode(p, user))
                    .then(p => convertStatus(p));
            } catch (e: any) {
                console.error(e);
                ctx.status = 401;
                ctx.body = e.response.data;
            }
        },
    );

    router.post<{ Params: { id: string } }>(
        "/v1/statuses/:id/unpin",
        async (ctx) => {
            try {
                const auth = await authenticate(ctx.headers.authorization, null);
                const user = auth[0] ?? null;

                if (!user) {
                    ctx.status = 401;
                    return;
                }

                const id = convertId(ctx.params.id, IdType.IceshrimpId);
                const note = await getNote(id, user).catch(_ => null);

                if (note === null) {
                    ctx.status = 404;
                    return;
                }

                ctx.body = await NoteHelpers.unpinNote(note, user)
                    .then(p => NoteConverter.encode(p, user))
                    .then(p => convertStatus(p));
            } catch (e: any) {
                console.error(e);
                ctx.status = 401;
                ctx.body = e.response.data;
            }
        },
    );

    router.post<{ Params: { id: string; name: string } }>(
        "/v1/statuses/:id/react/:name",
        async (ctx) => {
            try {
                const auth = await authenticate(ctx.headers.authorization, null);
                const user = auth[0] ?? null;

                if (!user) {
                    ctx.status = 401;
                    return;
                }

                const id = convertId(ctx.params.id, IdType.IceshrimpId);
                const note = await getNote(id, user).catch(_ => null);

                if (note === null) {
                    ctx.status = 404;
                    return;
                }

                ctx.body = await NoteHelpers.reactToNote(note, user, ctx.params.name)
                    .then(p => NoteConverter.encode(p, user))
                    .then(p => convertStatus(p));
            } catch (e: any) {
                console.error(e);
                ctx.status = 401;
                ctx.body = e.response.data;
            }
        },
    );

    router.post<{ Params: { id: string; name: string } }>(
        "/v1/statuses/:id/unreact/:name",
        async (ctx) => {
            try {
                const auth = await authenticate(ctx.headers.authorization, null);
                const user = auth[0] ?? null;

                if (!user) {
                    ctx.status = 401;
                    return;
                }

                const id = convertId(ctx.params.id, IdType.IceshrimpId);
                const note = await getNote(id, user).catch(_ => null);

                if (note === null) {
                    ctx.status = 404;
                    return;
                }

                ctx.body = await NoteHelpers.removeReactFromNote(note, user)
                    .then(p => NoteConverter.encode(p, user))
                    .then(p => convertStatus(p));
            } catch (e: any) {
                console.error(e);
                ctx.status = 401;
                ctx.body = e.response.data;
            }
        },
    );
    router.get<{ Params: { id: string } }>("/v1/polls/:id", async (ctx) => {
        try {
            const auth = await authenticate(ctx.headers.authorization, null);
            const user = auth[0] ?? null;

            const id = convertId(ctx.params.id, IdType.IceshrimpId);
            const note = await getNote(id, user).catch(_ => null);

            if (note === null || !note.hasPoll) {
                ctx.status = 404;
                return;
            }

            const data = await PollHelpers.getPoll(note, user);
            ctx.body = convertPoll(data);
        } catch (e: any) {
            console.error(e);
            ctx.status = 401;
            ctx.body = e.response.data;
        }
    });
    router.post<{ Params: { id: string } }>(
        "/v1/polls/:id/votes",
        async (ctx) => {
            try {
                const auth = await authenticate(ctx.headers.authorization, null);
                const user = auth[0] ?? null;

                if (!user) {
                    ctx.status = 401;
                    return;
                }

                const id = convertId(ctx.params.id, IdType.IceshrimpId);
                const note = await getNote(id, user).catch(_ => null);

                if (note === null || !note.hasPoll) {
                    ctx.status = 404;
                    return;
                }

                const body: any = ctx.request.body;
                const choices = toArray(body.choices ?? []).map(p => parseInt(p));
                if (choices.length < 1) {
                    ctx.status = 400;
                    ctx.body = {error: 'Must vote for at least one option'};
                    return;
                }

                const data = await PollHelpers.voteInPoll(choices, note, user);
                ctx.body = convertPoll(data);
            } catch (e: any) {
                console.error(e);
                ctx.status = 401;
                ctx.body = e.response.data;
            }
        },
    );
}

function getIdempotencyKey(headers: any, user: ILocalUser): string | null {
    if (headers["idempotency-key"] === undefined || headers["idempotency-key"] === null) return null;
    return `${user.id}-${Array.isArray(headers["idempotency-key"]) ? headers["idempotency-key"].at(-1)! : headers["idempotency-key"]}`;
}

async function getFromIdempotencyCache(key: string): Promise<MastodonEntity.Status | undefined> {
    return postIdempotencyLocks.acquire(key, async (): Promise<MastodonEntity.Status | undefined> => {
        if (await postIdempotencyCache.get(key) !== undefined) {
            let i = 5;
            while ((await postIdempotencyCache.get(key))?.status === undefined) {
                if (++i > 5) throw new Error('Post is duplicate but unable to resolve original');
                await new Promise((resolve) => {
                    setTimeout(resolve, 500);
                });
            }

            return (await postIdempotencyCache.get(key))?.status;
        } else {
            await postIdempotencyCache.set(key, {});
            return undefined;
        }
    });
}
