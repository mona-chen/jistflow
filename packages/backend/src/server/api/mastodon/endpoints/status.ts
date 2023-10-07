import Router from "@koa/router";
import { NoteConverter } from "@/server/api/mastodon/converters/note.js";
import { NoteHelpers } from "@/server/api/mastodon/helpers/note.js";
import { limitToInt, normalizeUrlQuery } from "@/server/api/mastodon/endpoints/timeline.js";
import { UserConverter } from "@/server/api/mastodon/converters/user.js";
import { PollHelpers } from "@/server/api/mastodon/helpers/poll.js";
import { toArray } from "@/prelude/array.js";
import { auth } from "@/server/api/mastodon/middleware/auth.js";
import { MastoApiError } from "@/server/api/mastodon/middleware/catch-errors.js";

export function setupEndpointsStatus(router: Router): void {
    router.post("/v1/statuses",
        auth(true, ['write:statuses']),
        async (ctx) => {
            const key = NoteHelpers.getIdempotencyKey(ctx);
            if (key !== null) {
                const result = await NoteHelpers.getFromIdempotencyCache(key);

                if (result) {
                    ctx.body = result;
                    return;
                }
            }

            let request = NoteHelpers.normalizeComposeOptions(ctx.request.body);
            ctx.body = await NoteHelpers.createNote(request, ctx)
                .then(p => NoteConverter.encode(p, ctx));

            if (key !== null) NoteHelpers.postIdempotencyCache.set(key, { status: ctx.body });
        }
    );
    router.put("/v1/statuses/:id",
        auth(true, ['write:statuses']),
        async (ctx) => {
            const note = await NoteHelpers.getNoteOr404(ctx.params.id, ctx);
            let request = NoteHelpers.normalizeEditOptions(ctx.request.body);
            ctx.body = await NoteHelpers.editNote(request, note, ctx)
                .then(p => NoteConverter.encode(p, ctx));
        }
    );
    router.get<{ Params: { id: string } }>("/v1/statuses/:id",
        auth(false, ["read:statuses"]),
        async (ctx) => {
            const note = await NoteHelpers.getNoteOr404(ctx.params.id, ctx);

            ctx.body = await NoteConverter.encode(note, ctx);
        }
    );
    router.delete<{ Params: { id: string } }>("/v1/statuses/:id",
        auth(true, ['write:statuses']),
        async (ctx) => {
            const note = await NoteHelpers.getNoteOr404(ctx.params.id, ctx);
            ctx.body = await NoteHelpers.deleteNote(note, ctx);
        }
    );

    router.get<{ Params: { id: string } }>(
        "/v1/statuses/:id/context",
        auth(false, ["read:statuses"]),
        async (ctx) => {
            //FIXME: determine final limits within helper functions instead of here
            const note = await NoteHelpers.getNoteOr404(ctx.params.id, ctx);
            const ancestors = await NoteHelpers.getNoteAncestors(note, ctx.user ? 4096 : 60, ctx)
                .then(n => NoteConverter.encodeMany(n, ctx));
            const descendants = await NoteHelpers.getNoteDescendants(note, ctx.user ? 4096 : 40, ctx.user ? 4096 : 20, ctx)
                .then(n => NoteConverter.encodeMany(n, ctx));

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
            const note = await NoteHelpers.getNoteOr404(ctx.params.id, ctx);
            ctx.body = await NoteHelpers.getNoteEditHistory(note, ctx);
        }
    );
    router.get<{ Params: { id: string } }>(
        "/v1/statuses/:id/source",
        auth(true, ["read:statuses"]),
        async (ctx) => {
            const note = await NoteHelpers.getNoteOr404(ctx.params.id, ctx);
            ctx.body = NoteHelpers.getNoteSource(note);
        }
    );
    router.get<{ Params: { id: string } }>(
        "/v1/statuses/:id/reblogged_by",
        auth(false, ["read:statuses"]),
        async (ctx) => {
            const note = await NoteHelpers.getNoteOr404(ctx.params.id, ctx);
            const args = normalizeUrlQuery(limitToInt(ctx.query as any));
            const res = await NoteHelpers.getNoteRebloggedBy(note, args.max_id, args.since_id, args.min_id, args.limit, ctx);
            ctx.body = await UserConverter.encodeMany(res, ctx);
        }
    );
    router.get<{ Params: { id: string } }>(
        "/v1/statuses/:id/favourited_by",
        auth(false, ["read:statuses"]),
        async (ctx) => {
            const note = await NoteHelpers.getNoteOr404(ctx.params.id, ctx);
            const args = normalizeUrlQuery(limitToInt(ctx.query as any));
            const res = await NoteHelpers.getNoteFavoritedBy(note, args.max_id, args.since_id, args.min_id, args.limit, ctx);
            ctx.body = await UserConverter.encodeMany(res, ctx);
        }
    );
    router.post<{ Params: { id: string } }>(
        "/v1/statuses/:id/favourite",
        auth(true, ["write:favourites"]),
        async (ctx) => {
            const note = await NoteHelpers.getNoteOr404(ctx.params.id, ctx);
            const reaction = await NoteHelpers.getDefaultReaction();

            ctx.body = await NoteHelpers.reactToNote(note, reaction, ctx)
                .then(p => NoteConverter.encode(p, ctx));
        }
    );
    router.post<{ Params: { id: string } }>(
        "/v1/statuses/:id/unfavourite",
        auth(true, ["write:favourites"]),
        async (ctx) => {
            const note = await NoteHelpers.getNoteOr404(ctx.params.id, ctx);

            ctx.body = await NoteHelpers.removeReactFromNote(note, ctx)
                .then(p => NoteConverter.encode(p, ctx));
        },
    );

    router.post<{ Params: { id: string } }>(
        "/v1/statuses/:id/reblog",
        auth(true, ["write:statuses"]),
        async (ctx) => {
            const note = await NoteHelpers.getNoteOr404(ctx.params.id, ctx);

            ctx.body = await NoteHelpers.reblogNote(note, ctx)
                .then(p => NoteConverter.encode(p, ctx));
        },
    );

    router.post<{ Params: { id: string } }>(
        "/v1/statuses/:id/unreblog",
        auth(true, ["write:statuses"]),
        async (ctx) => {
            const note = await NoteHelpers.getNoteOr404(ctx.params.id, ctx);

            ctx.body = await NoteHelpers.unreblogNote(note, ctx)
                .then(p => NoteConverter.encode(p, ctx));
        },
    );

    router.post<{ Params: { id: string } }>(
        "/v1/statuses/:id/bookmark",
        auth(true, ["write:bookmarks"]),
        async (ctx) => {
            const note = await NoteHelpers.getNoteOr404(ctx.params.id, ctx);

            ctx.body = await NoteHelpers.bookmarkNote(note, ctx)
                .then(p => NoteConverter.encode(p, ctx));
        },
    );

    router.post<{ Params: { id: string } }>(
        "/v1/statuses/:id/unbookmark",
        auth(true, ["write:bookmarks"]),
        async (ctx) => {
            const note = await NoteHelpers.getNoteOr404(ctx.params.id, ctx);

            ctx.body = await NoteHelpers.unbookmarkNote(note, ctx)
                .then(p => NoteConverter.encode(p, ctx));
        },
    );

    router.post<{ Params: { id: string } }>(
        "/v1/statuses/:id/pin",
        auth(true, ["write:accounts"]),
        async (ctx) => {
            const note = await NoteHelpers.getNoteOr404(ctx.params.id, ctx);

            ctx.body = await NoteHelpers.pinNote(note, ctx)
                .then(p => NoteConverter.encode(p, ctx));
        },
    );

    router.post<{ Params: { id: string } }>(
        "/v1/statuses/:id/unpin",
        auth(true, ["write:accounts"]),
        async (ctx) => {
            const note = await NoteHelpers.getNoteOr404(ctx.params.id, ctx);

            ctx.body = await NoteHelpers.unpinNote(note, ctx)
                .then(p => NoteConverter.encode(p, ctx));
        },
    );

    router.post<{ Params: { id: string; name: string } }>(
        "/v1/statuses/:id/react/:name",
        auth(true, ["write:favourites"]),
        async (ctx) => {
            const note = await NoteHelpers.getNoteOr404(ctx.params.id, ctx);

            ctx.body = await NoteHelpers.reactToNote(note, ctx.params.name, ctx)
                .then(p => NoteConverter.encode(p, ctx));
        },
    );

    router.post<{ Params: { id: string; name: string } }>(
        "/v1/statuses/:id/unreact/:name",
        auth(true, ["write:favourites"]),
        async (ctx) => {
            const note = await NoteHelpers.getNoteOr404(ctx.params.id, ctx);

            ctx.body = await NoteHelpers.removeReactFromNote(note, ctx)
                .then(p => NoteConverter.encode(p, ctx));
        },
    );
    router.get<{ Params: { id: string } }>("/v1/polls/:id",
        auth(false, ["read:statuses"]),
        async (ctx) => {
            const note = await NoteHelpers.getNoteOr404(ctx.params.id, ctx);
            ctx.body = await PollHelpers.getPoll(note, ctx);
        });
    router.post<{ Params: { id: string } }>(
        "/v1/polls/:id/votes",
        auth(true, ["write:statuses"]),
        async (ctx) => {
            const note = await NoteHelpers.getNoteOr404(ctx.params.id, ctx);

            const body: any = ctx.request.body;
            const choices = toArray(body.choices ?? []).map(p => parseInt(p));
            if (choices.length < 1) throw new MastoApiError(400, "Must vote for at least one option");

            ctx.body = await PollHelpers.voteInPoll(choices, note, ctx);
        },
    );
}
