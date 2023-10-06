import Router from "@koa/router";
import { convertId, IdType } from "../../index.js";
import {
    convertAccountId,
    convertPollId,
    convertStatusEditIds,
    convertStatusIds,
    convertStatusSourceId,
} from "../converters.js";
import { NoteConverter } from "@/server/api/mastodon/converters/note.js";
import { NoteHelpers } from "@/server/api/mastodon/helpers/note.js";
import { convertPaginationArgsIds, limitToInt, normalizeUrlQuery } from "@/server/api/mastodon/endpoints/timeline.js";
import { PaginationHelpers } from "@/server/api/mastodon/helpers/pagination.js";
import { UserConverter } from "@/server/api/mastodon/converters/user.js";
import { PollHelpers } from "@/server/api/mastodon/helpers/poll.js";
import { toArray } from "@/prelude/array.js";
import { auth } from "@/server/api/mastodon/middleware/auth.js";

export function setupEndpointsStatus(router: Router): void {
    router.post("/v1/statuses",
        auth(true, ['write:statuses']),
        async (ctx) => {
            const key = NoteHelpers.getIdempotencyKey(ctx.headers, ctx.user);
            if (key !== null) {
                const result = await NoteHelpers.getFromIdempotencyCache(key);

                if (result) {
                    ctx.body = result;
                    return;
                }
            }

            let request = NoteHelpers.normalizeComposeOptions(ctx.request.body);
            ctx.body = await NoteHelpers.createNote(request, ctx.user)
                .then(p => NoteConverter.encode(p, ctx.user))
                .then(p => convertStatusIds(p));

            if (key !== null) NoteHelpers.postIdempotencyCache.set(key, { status: ctx.body });
        }
    );
    router.put("/v1/statuses/:id",
        auth(true, ['write:statuses']),
        async (ctx) => {
            const noteId = convertId(ctx.params.id, IdType.IceshrimpId);
            const note = await NoteHelpers.getNoteOr404(noteId, ctx.user);
            let request = NoteHelpers.normalizeEditOptions(ctx.request.body);
            ctx.body = await NoteHelpers.editNote(request, note, ctx.user)
                .then(p => NoteConverter.encode(p, ctx.user))
                .then(p => convertStatusIds(p));
        }
    );
    router.get<{ Params: { id: string } }>("/v1/statuses/:id",
        auth(false, ["read:statuses"]),
        async (ctx) => {
            const noteId = convertId(ctx.params.id, IdType.IceshrimpId);
            const note = await NoteHelpers.getNoteOr404(noteId, ctx.user);

            const status = await NoteConverter.encode(note, ctx.user);
            ctx.body = convertStatusIds(status);
        }
    );
    router.delete<{ Params: { id: string } }>("/v1/statuses/:id",
        auth(true, ['write:statuses']),
        async (ctx) => {
            const noteId = convertId(ctx.params.id, IdType.IceshrimpId);
            const note = await NoteHelpers.getNoteOr404(noteId, ctx.user);
            ctx.body = await NoteHelpers.deleteNote(note, ctx.user)
                .then(p => convertStatusIds(p));
        }
    );

    router.get<{ Params: { id: string } }>(
        "/v1/statuses/:id/context",
        auth(false, ["read:statuses"]),
        async (ctx) => {
            const id = convertId(ctx.params.id, IdType.IceshrimpId);
            const note = await NoteHelpers.getNoteOr404(id, ctx.user);
            const ancestors = await NoteHelpers.getNoteAncestors(note, ctx.user, ctx.user ? 4096 : 60)
                .then(n => NoteConverter.encodeMany(n, ctx.user, ctx.cache))
                .then(n => n.map(s => convertStatusIds(s)));
            const descendants = await NoteHelpers.getNoteDescendants(note, ctx.user, ctx.user ? 4096 : 40, ctx.user ? 4096 : 20)
                .then(n => NoteConverter.encodeMany(n, ctx.user, ctx.cache))
                .then(n => n.map(s => convertStatusIds(s)));

            ctx.body = {
                ancestors,
                descendants,
            };
        }
    );
    router.get<{ Params: { id: string } }>(
        "/v1/statuses/:id/history",
        auth(false, ["read:statuses"]),
        async (ctx) => {
            const id = convertId(ctx.params.id, IdType.IceshrimpId);
            const note = await NoteHelpers.getNoteOr404(id, ctx.user);
            const res = await NoteHelpers.getNoteEditHistory(note);
            ctx.body = res.map(p => convertStatusEditIds(p));
        }
    );
    router.get<{ Params: { id: string } }>(
        "/v1/statuses/:id/source",
        auth(true, ["read:statuses"]),
        async (ctx) => {
            const id = convertId(ctx.params.id, IdType.IceshrimpId);
            const note = await NoteHelpers.getNoteOr404(id, ctx.user);
            const src = NoteHelpers.getNoteSource(note);
            ctx.body = convertStatusSourceId(src);
        }
    );
    router.get<{ Params: { id: string } }>(
        "/v1/statuses/:id/reblogged_by",
        auth(false, ["read:statuses"]),
        async (ctx) => {
            const id = convertId(ctx.params.id, IdType.IceshrimpId);
            const note = await NoteHelpers.getNoteOr404(id, ctx.user);
            const args = normalizeUrlQuery(convertPaginationArgsIds(limitToInt(ctx.query as any)));
            const res = await NoteHelpers.getNoteRebloggedBy(note, ctx.user, args.max_id, args.since_id, args.min_id, args.limit);
            const users = await UserConverter.encodeMany(res.data, ctx.cache);
            ctx.body = users.map(m => convertAccountId(m));
            ctx.pagination = res.pagination;
        }
    );
    router.get<{ Params: { id: string } }>(
        "/v1/statuses/:id/favourited_by",
        auth(false, ["read:statuses"]),
        async (ctx) => {
            const id = convertId(ctx.params.id, IdType.IceshrimpId);
            const note = await NoteHelpers.getNoteOr404(id, ctx.user);
            const args = normalizeUrlQuery(convertPaginationArgsIds(limitToInt(ctx.query as any)));
            const res = await NoteHelpers.getNoteFavoritedBy(note, args.max_id, args.since_id, args.min_id, args.limit);
            const users = await UserConverter.encodeMany(res.data, ctx.cache);
            ctx.body = users.map(m => convertAccountId(m));
            ctx.pagination = res.pagination;
        }
    );
    router.post<{ Params: { id: string } }>(
        "/v1/statuses/:id/favourite",
        auth(true, ["write:favourites"]),
        async (ctx) => {
            const id = convertId(ctx.params.id, IdType.IceshrimpId);
            const note = await NoteHelpers.getNoteOr404(id, ctx.user);
            const reaction = await NoteHelpers.getDefaultReaction();

            ctx.body = await NoteHelpers.reactToNote(note, ctx.user, reaction)
                .then(p => NoteConverter.encode(p, ctx.user))
                .then(p => convertStatusIds(p));
        }
    );
    router.post<{ Params: { id: string } }>(
        "/v1/statuses/:id/unfavourite",
        auth(true, ["write:favourites"]),
        async (ctx) => {
            const id = convertId(ctx.params.id, IdType.IceshrimpId);
            const note = await NoteHelpers.getNoteOr404(id, ctx.user);

            ctx.body = await NoteHelpers.removeReactFromNote(note, ctx.user)
                .then(p => NoteConverter.encode(p, ctx.user))
                .then(p => convertStatusIds(p));
        },
    );

    router.post<{ Params: { id: string } }>(
        "/v1/statuses/:id/reblog",
        auth(true, ["write:statuses"]),
        async (ctx) => {
            const id = convertId(ctx.params.id, IdType.IceshrimpId);
            const note = await NoteHelpers.getNoteOr404(id, ctx.user);

            ctx.body = await NoteHelpers.reblogNote(note, ctx.user)
                .then(p => NoteConverter.encode(p, ctx.user))
                .then(p => convertStatusIds(p));
        },
    );

    router.post<{ Params: { id: string } }>(
        "/v1/statuses/:id/unreblog",
        auth(true, ["write:statuses"]),
        async (ctx) => {
            const id = convertId(ctx.params.id, IdType.IceshrimpId);
            const note = await NoteHelpers.getNoteOr404(id, ctx.user);

            ctx.body = await NoteHelpers.unreblogNote(note, ctx.user)
                .then(p => NoteConverter.encode(p, ctx.user))
                .then(p => convertStatusIds(p));
        },
    );

    router.post<{ Params: { id: string } }>(
        "/v1/statuses/:id/bookmark",
        auth(true, ["write:bookmarks"]),
        async (ctx) => {
            const id = convertId(ctx.params.id, IdType.IceshrimpId);
            const note = await NoteHelpers.getNoteOr404(id, ctx.user);

            ctx.body = await NoteHelpers.bookmarkNote(note, ctx.user)
                .then(p => NoteConverter.encode(p, ctx.user))
                .then(p => convertStatusIds(p));
        },
    );

    router.post<{ Params: { id: string } }>(
        "/v1/statuses/:id/unbookmark",
        auth(true, ["write:bookmarks"]),
        async (ctx) => {
            const id = convertId(ctx.params.id, IdType.IceshrimpId);
            const note = await NoteHelpers.getNoteOr404(id, ctx.user);

            ctx.body = await NoteHelpers.unbookmarkNote(note, ctx.user)
                .then(p => NoteConverter.encode(p, ctx.user))
                .then(p => convertStatusIds(p));
        },
    );

    router.post<{ Params: { id: string } }>(
        "/v1/statuses/:id/pin",
        auth(true, ["write:accounts"]),
        async (ctx) => {
            const id = convertId(ctx.params.id, IdType.IceshrimpId);
            const note = await NoteHelpers.getNoteOr404(id, ctx.user);

            ctx.body = await NoteHelpers.pinNote(note, ctx.user)
                .then(p => NoteConverter.encode(p, ctx.user))
                .then(p => convertStatusIds(p));
        },
    );

    router.post<{ Params: { id: string } }>(
        "/v1/statuses/:id/unpin",
        auth(true, ["write:accounts"]),
        async (ctx) => {
            const id = convertId(ctx.params.id, IdType.IceshrimpId);
            const note = await NoteHelpers.getNoteOr404(id, ctx.user);

            ctx.body = await NoteHelpers.unpinNote(note, ctx.user)
                .then(p => NoteConverter.encode(p, ctx.user))
                .then(p => convertStatusIds(p));
        },
    );

    router.post<{ Params: { id: string; name: string } }>(
        "/v1/statuses/:id/react/:name",
        auth(true, ["write:favourites"]),
        async (ctx) => {
            const id = convertId(ctx.params.id, IdType.IceshrimpId);
            const note = await NoteHelpers.getNoteOr404(id, ctx.user);

            ctx.body = await NoteHelpers.reactToNote(note, ctx.user, ctx.params.name)
                .then(p => NoteConverter.encode(p, ctx.user))
                .then(p => convertStatusIds(p));
        },
    );

    router.post<{ Params: { id: string; name: string } }>(
        "/v1/statuses/:id/unreact/:name",
        auth(true, ["write:favourites"]),
        async (ctx) => {
            const id = convertId(ctx.params.id, IdType.IceshrimpId);
            const note = await NoteHelpers.getNoteOr404(id, ctx.user);

            ctx.body = await NoteHelpers.removeReactFromNote(note, ctx.user)
                .then(p => NoteConverter.encode(p, ctx.user))
                .then(p => convertStatusIds(p));
        },
    );
    router.get<{ Params: { id: string } }>("/v1/polls/:id",
        auth(false, ["read:statuses"]),
        async (ctx) => {
            const id = convertId(ctx.params.id, IdType.IceshrimpId);
            const note = await NoteHelpers.getNoteOr404(id, ctx.user);
            const data = await PollHelpers.getPoll(note, ctx.user);
            ctx.body = convertPollId(data);
        });
    router.post<{ Params: { id: string } }>(
        "/v1/polls/:id/votes",
        auth(true, ["write:statuses"]),
        async (ctx) => {
            const id = convertId(ctx.params.id, IdType.IceshrimpId);
            const note = await NoteHelpers.getNoteOr404(id, ctx.user);

            const body: any = ctx.request.body;
            const choices = toArray(body.choices ?? []).map(p => parseInt(p));
            if (choices.length < 1) {
                ctx.status = 400;
                ctx.body = { error: 'Must vote for at least one option' };
                return;
            }

            const data = await PollHelpers.voteInPoll(choices, note, ctx.user);
            ctx.body = convertPollId(data);
        },
    );
}
