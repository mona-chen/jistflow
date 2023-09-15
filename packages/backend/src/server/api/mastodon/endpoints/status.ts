import Router from "@koa/router";
import { getClient } from "../ApiMastodonCompatibleService.js";
import { emojiRegexAtStartToEnd } from "@/misc/emoji-regex.js";
import axios from "axios";
import querystring from "node:querystring";
import qs from "qs";
import { convertId, IdType } from "../../index.js";
import { convertAccount, convertAttachment, convertPoll, convertStatus, } from "../converters.js";
import { NoteConverter } from "@/server/api/mastodon/converters/note.js";
import { getNote } from "@/server/api/common/getters.js";
import authenticate from "@/server/api/authenticate.js";
import { NoteHelpers } from "@/server/api/mastodon/helpers/note.js";
import { Note } from "@/models/entities/note.js";

function normalizeQuery(data: any) {
	const str = querystring.stringify(data);
	return qs.parse(str);
}

export function apiStatusMastodon(router: Router): void {
	router.post("/v1/statuses", async (ctx) => {
		const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
		const accessTokens = ctx.headers.authorization;
		const client = getClient(BASE_URL, accessTokens);
		try {
			let body: any = ctx.request.body;
			if (body.in_reply_to_id)
				body.in_reply_to_id = convertId(body.in_reply_to_id, IdType.IceshrimpId);
			if (body.quote_id)
				body.quote_id = convertId(body.quote_id, IdType.IceshrimpId);
			if (
				(!body.poll && body["poll[options][]"]) ||
				(!body.media_ids && body["media_ids[]"])
			) {
				body = normalizeQuery(body);
			}
			const text = body.status;
			const removed = text.replace(/@\S+/g, "").replace(/\s|​/g, "");
			const isDefaultEmoji = emojiRegexAtStartToEnd.test(removed);
			const isCustomEmoji = /^:[a-zA-Z0-9@_]+:$/.test(removed);
			if ((body.in_reply_to_id && isDefaultEmoji) || isCustomEmoji) {
				const a = await client.createEmojiReaction(
					body.in_reply_to_id,
					removed,
				);
				ctx.body = a.data;
			}
			if (body.in_reply_to_id && removed === "/unreact") {
				try {
					const id = body.in_reply_to_id;
					const post = await client.getStatus(id);
					const react = post.data.reactions.filter((e) => e.me)[0].name;
					const data = await client.deleteEmojiReaction(id, react);
					ctx.body = data.data;
				} catch (e: any) {
					console.error(e);
					ctx.status = 401;
					ctx.body = e.response.data;
				}
			}
			if (!body.media_ids) body.media_ids = undefined;
			if (body.media_ids && !body.media_ids.length) body.media_ids = undefined;
			if (body.media_ids) {
				body.media_ids = (body.media_ids as string[]).map((p) =>
					convertId(p, IdType.IceshrimpId),
				);
			}
			const {sensitive} = body;
			body.sensitive =
				typeof sensitive === "string" ? sensitive === "true" : sensitive;

			if (body.poll) {
				if (
					body.poll.expires_in != null &&
					typeof body.poll.expires_in === "string"
				)
					body.poll.expires_in = parseInt(body.poll.expires_in);
				if (
					body.poll.multiple != null &&
					typeof body.poll.multiple === "string"
				)
					body.poll.multiple = body.poll.multiple == "true";
				if (
					body.poll.hide_totals != null &&
					typeof body.poll.hide_totals === "string"
				)
					body.poll.hide_totals = body.poll.hide_totals == "true";
			}

			const data = await client.postStatus(text, body);
			ctx.body = convertStatus(data.data);
		} catch (e: any) {
			console.error(e);
			ctx.status = 401;
			ctx.body = e.response.data;
		}
	});
	router.put("/v1/statuses/:id", async (ctx) => {
		const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
		const accessTokens = ctx.headers.authorization;
		const client = getClient(BASE_URL, accessTokens);
		try {
			ctx.params.id = convertId(ctx.params.id, IdType.IceshrimpId);
			let body: any = ctx.request.body;
			if (
				(!body.poll && body["poll[options][]"]) ||
				(!body.media_ids && body["media_ids[]"])
			) {
				body = normalizeQuery(body);
			}
			if (!body.media_ids) body.media_ids = undefined;
			if (body.media_ids && !body.media_ids.length) body.media_ids = undefined;
			if (body.media_ids) {
				body.media_ids = (body.media_ids as string[]).map((p) =>
					convertId(p, IdType.IceshrimpId),
				);
			}
			const {sensitive} = body;
			body.sensitive =
				typeof sensitive === "string" ? sensitive === "true" : sensitive;

			if (body.poll) {
				if (
					body.poll.expires_in != null &&
					typeof body.poll.expires_in === "string"
				)
					body.poll.expires_in = parseInt(body.poll.expires_in);
				if (
					body.poll.multiple != null &&
					typeof body.poll.multiple === "string"
				)
					body.poll.multiple = body.poll.multiple == "true";
				if (
					body.poll.hide_totals != null &&
					typeof body.poll.hide_totals === "string"
				)
					body.poll.hide_totals = body.poll.hide_totals == "true";
			}

			const data = await client.editStatus(ctx.params.id, body);
			ctx.body = convertStatus(data.data);
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
		const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
		const accessTokens = ctx.headers.authorization;
		const client = getClient(BASE_URL, accessTokens);
		try {
			const data = await client.deleteStatus(
				convertId(ctx.params.id, IdType.IceshrimpId),
			);
			ctx.body = data.data;
		} catch (e: any) {
			console.error(e.response.data, request.params.id);
			ctx.status = 401;
			ctx.body = e.response.data;
		}
	});

	interface IReaction {
		id: string;
		createdAt: string;
		user: MisskeyEntity.User;
		type: string;
	}

	router.get<{ Params: { id: string } }>(
		"/v1/statuses/:id/context",
		async (ctx) => {
			const accessTokens = ctx.headers.authorization;
			try {
				const auth = await authenticate(ctx.headers.authorization, null);
				const user = auth[0] ?? null;

				const id = convertId(ctx.params.id, IdType.IceshrimpId);
				const note = await getNote(id, user ?? null).then(n => n).catch(() => null);
				if (!note) {
					if (!note) {
						ctx.status = 404;
						return;
					}
				}

				const ancestors = await NoteHelpers.getNoteAncestors(note, user, user ? 4096 : 60)
					.then(n => NoteConverter.encodeMany(n, user))
					.then(n => n.map(s => convertStatus(s)));
				const descendants = await NoteHelpers.getNoteDescendants(note, user, user ? 4096 : 40, user ? 4096 : 20)
					.then(n => NoteConverter.encodeMany(n, user))
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
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const data = await client.getStatusHistory(
					convertId(ctx.params.id, IdType.IceshrimpId),
				);
				ctx.body = data.data.map((account) => convertAccount(account));
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
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const data = await client.getStatusRebloggedBy(
					convertId(ctx.params.id, IdType.IceshrimpId),
				);
				ctx.body = data.data.map((account) => convertAccount(account));
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
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const data = await client.getStatusFavouritedBy(
					convertId(ctx.params.id, IdType.IceshrimpId),
				);
				ctx.body = data.data.map((account) => convertAccount(account));
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
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			const react = await getFirstReaction(BASE_URL, accessTokens);
			try {
				const a = (await client.createEmojiReaction(
					convertId(ctx.params.id, IdType.IceshrimpId),
					react,
				)) as any;
				//const data = await client.favouriteStatus(ctx.params.id) as any;
				ctx.body = convertStatus(a.data);
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);
	router.post<{ Params: { id: string } }>(
		"/v1/statuses/:id/unfavourite",
		async (ctx) => {
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			const react = await getFirstReaction(BASE_URL, accessTokens);
			try {
				const data = await client.deleteEmojiReaction(
					convertId(ctx.params.id, IdType.IceshrimpId),
					react,
				);
				ctx.body = convertStatus(data.data);
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
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const data = await client.reblogStatus(
					convertId(ctx.params.id, IdType.IceshrimpId),
				);
				ctx.body = convertStatus(data.data);
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
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const data = await client.unreblogStatus(
					convertId(ctx.params.id, IdType.IceshrimpId),
				);
				ctx.body = convertStatus(data.data);
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
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const data = await client.bookmarkStatus(
					convertId(ctx.params.id, IdType.IceshrimpId),
				);
				ctx.body = convertStatus(data.data);
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
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const data = await client.unbookmarkStatus(
					convertId(ctx.params.id, IdType.IceshrimpId),
				);
				ctx.body = convertStatus(data.data);
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
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const data = await client.pinStatus(
					convertId(ctx.params.id, IdType.IceshrimpId),
				);
				ctx.body = convertStatus(data.data);
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
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const data = await client.unpinStatus(
					convertId(ctx.params.id, IdType.IceshrimpId),
				);
				ctx.body = convertStatus(data.data);
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
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const data = await client.reactStatus(
					convertId(ctx.params.id, IdType.IceshrimpId),
					ctx.params.name,
				);
				ctx.body = convertStatus(data.data);
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
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const data = await client.unreactStatus(
					convertId(ctx.params.id, IdType.IceshrimpId),
					ctx.params.name,
				);
				ctx.body = convertStatus(data.data);
			} catch (e: any) {
				console.error(e);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);

	router.get<{ Params: { id: string } }>("/v1/media/:id", async (ctx) => {
		const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
		const accessTokens = ctx.headers.authorization;
		const client = getClient(BASE_URL, accessTokens);
		try {
			const data = await client.getMedia(
				convertId(ctx.params.id, IdType.IceshrimpId),
			);
			ctx.body = convertAttachment(data.data);
		} catch (e: any) {
			console.error(e);
			ctx.status = 401;
			ctx.body = e.response.data;
		}
	});
	router.put<{ Params: { id: string } }>("/v1/media/:id", async (ctx) => {
		const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
		const accessTokens = ctx.headers.authorization;
		const client = getClient(BASE_URL, accessTokens);
		try {
			const data = await client.updateMedia(
				convertId(ctx.params.id, IdType.IceshrimpId),
				ctx.request.body as any,
			);
			ctx.body = convertAttachment(data.data);
		} catch (e: any) {
			console.error(e);
			ctx.status = 401;
			ctx.body = e.response.data;
		}
	});
	router.get<{ Params: { id: string } }>("/v1/polls/:id", async (ctx) => {
		const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
		const accessTokens = ctx.headers.authorization;
		const client = getClient(BASE_URL, accessTokens);
		try {
			const data = await client.getPoll(
				convertId(ctx.params.id, IdType.IceshrimpId),
			);
			ctx.body = convertPoll(data.data);
		} catch (e: any) {
			console.error(e);
			ctx.status = 401;
			ctx.body = e.response.data;
		}
	});
	router.post<{ Params: { id: string } }>(
		"/v1/polls/:id/votes",
		async (ctx) => {
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const data = await client.votePoll(
					convertId(ctx.params.id, IdType.IceshrimpId),
					(ctx.request.body as any).choices,
				);
				ctx.body = convertPoll(data.data);
			} catch (e: any) {
				console.error(e);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);
}

async function getFirstReaction(
	BASE_URL: string,
	accessTokens: string | undefined,
) {
	const accessTokenArr = accessTokens?.split(" ") ?? [null];
	const accessToken = accessTokenArr[accessTokenArr.length - 1];
	let react = "⭐";
	try {
		const api = await axios.post(`${BASE_URL}/api/i/registry/get-unsecure`, {
			scope: ["client", "base"],
			key: "reactions",
			i: accessToken,
		});
		const reactRaw = api.data;
		react = Array.isArray(reactRaw) ? api.data[0] : "⭐";
		console.log(api.data);
		return react;
	} catch (e) {
		return react;
	}
}
