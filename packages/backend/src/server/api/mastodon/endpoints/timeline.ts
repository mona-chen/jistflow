import Router from "@koa/router";
import megalodon, { Entity, MegalodonInterface } from "@calckey/megalodon";
import { getClient } from "../ApiMastodonCompatibleService.js";
import { statusModel } from "./status.js";
import Autolinker from "autolinker";
import { ParsedUrlQuery } from "querystring";

export function limitToInt(q: ParsedUrlQuery) {
	let object: any = q;
	if (q.limit)
		if (typeof q.limit === "string") object.limit = parseInt(q.limit, 10);
	return q;
}

export function argsToBools(q: ParsedUrlQuery) {
	let object: any = q;
	if (q.only_media)
		if (typeof q.only_media === "string")
			object.only_media = q.only_media.toLowerCase() === "true";
	if (q.exclude_replies)
		if (typeof q.exclude_replies === "string")
			object.exclude_replies = q.exclude_replies.toLowerCase() === "true";
	return q;
}

export function toTextWithReaction(status: Entity.Status[], host: string) {
	return status.map((t) => {
		if (!t) return statusModel(null, null, [], "no content");
		if (!t.emoji_reactions) return t;
		if (t.reblog) t.reblog = toTextWithReaction([t.reblog], host)[0];
		const reactions = t.emoji_reactions.map(
			(r) => `${r.name.replace("@.", "")} (${r.count}${r.me ? "* " : ""})`,
		);
		//t.emojis = getEmoji(t.content, host)
		t.content = `<p>${autoLinker(t.content, host)}</p><p>${reactions.join(
			", ",
		)}</p>`;
		return t;
	});
}
export function autoLinker(input: string, host: string) {
	return Autolinker.link(input, {
		hashtag: "twitter",
		mention: "twitter",
		email: false,
		stripPrefix: false,
		replaceFn: function (match) {
			switch (match.type) {
				case "url":
					return true;
				case "mention":
					console.log("Mention: ", match.getMention());
					console.log("Mention Service Name: ", match.getServiceName());
					return `<a href="https://${host}/@${encodeURIComponent(
						match.getMention(),
					)}" target="_blank">@${match.getMention()}</a>`;
				case "hashtag":
					console.log("Hashtag: ", match.getHashtag());
					return `<a href="https://${host}/tags/${encodeURIComponent(
						match.getHashtag(),
					)}" target="_blank">#${match.getHashtag()}</a>`;
			}
			return false;
		},
	});
}

export function apiTimelineMastodon(router: Router): void {
	router.get("/v1/timelines/public", async (ctx, reply) => {
		const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
		const accessTokens = ctx.headers.authorization;
		const client = getClient(BASE_URL, accessTokens);
		try {
			const query: any = ctx.query;
			const data = query.local
				? await client.getLocalTimeline(limitToInt(query))
				: await client.getPublicTimeline(limitToInt(query));
			ctx.body = toTextWithReaction(data.data, ctx.hostname);
		} catch (e: any) {
			console.error(e);
			console.error(e.response.data);
			ctx.status = 401;
			ctx.body = e.response.data;
		}
	});
	router.get<{ Params: { hashtag: string } }>(
		"/v1/timelines/tag/:hashtag",
		async (ctx, reply) => {
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const data = await client.getTagTimeline(
					ctx.params.hashtag,
					limitToInt(ctx.query),
				);
				ctx.body = toTextWithReaction(data.data, ctx.hostname);
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);
	router.get<{ Params: { hashtag: string } }>(
		"/v1/timelines/home",
		async (ctx, reply) => {
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const data = await client.getHomeTimeline(limitToInt(ctx.query));
				ctx.body = toTextWithReaction(data.data, ctx.hostname);
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);
	router.get<{ Params: { listId: string } }>(
		"/v1/timelines/list/:listId",
		async (ctx, reply) => {
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const data = await client.getListTimeline(
					ctx.params.listId,
					limitToInt(ctx.query),
				);
				ctx.body = toTextWithReaction(data.data, ctx.hostname);
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);
	router.get("/v1/conversations", async (ctx, reply) => {
		const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
		const accessTokens = ctx.headers.authorization;
		const client = getClient(BASE_URL, accessTokens);
		try {
			const data = await client.getConversationTimeline(limitToInt(ctx.query));
			ctx.body = data.data;
		} catch (e: any) {
			console.error(e);
			console.error(e.response.data);
			ctx.status = 401;
			ctx.body = e.response.data;
		}
	});
	router.get("/v1/lists", async (ctx, reply) => {
		const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
		const accessTokens = ctx.headers.authorization;
		const client = getClient(BASE_URL, accessTokens);
		try {
			const data = await client.getLists();
			ctx.body = data.data;
		} catch (e: any) {
			console.error(e);
			console.error(e.response.data);
			ctx.status = 401;
			ctx.body = e.response.data;
		}
	});
	router.get<{ Params: { id: string } }>(
		"/v1/lists/:id",
		async (ctx, reply) => {
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const data = await client.getList(ctx.params.id);
				ctx.body = data.data;
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);
	router.post("/v1/lists", async (ctx, reply) => {
		const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
		const accessTokens = ctx.headers.authorization;
		const client = getClient(BASE_URL, accessTokens);
		try {
			const data = await client.createList((ctx.query as any).title);
			ctx.body = data.data;
		} catch (e: any) {
			console.error(e);
			console.error(e.response.data);
			ctx.status = 401;
			ctx.body = e.response.data;
		}
	});
	router.put<{ Params: { id: string } }>(
		"/v1/lists/:id",
		async (ctx, reply) => {
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const data = await client.updateList(ctx.params.id, ctx.query as any);
				ctx.body = data.data;
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);
	router.delete<{ Params: { id: string } }>(
		"/v1/lists/:id",
		async (ctx, reply) => {
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const data = await client.deleteList(ctx.params.id);
				ctx.body = data.data;
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);
	router.get<{ Params: { id: string } }>(
		"/v1/lists/:id/accounts",
		async (ctx, reply) => {
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const data = await client.getAccountsInList(
					ctx.params.id,
					ctx.query as any,
				);
				ctx.body = data.data;
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);
	router.post<{ Params: { id: string } }>(
		"/v1/lists/:id/accounts",
		async (ctx, reply) => {
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const data = await client.addAccountsToList(
					ctx.params.id,
					(ctx.query as any).account_ids,
				);
				ctx.body = data.data;
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);
	router.delete<{ Params: { id: string } }>(
		"/v1/lists/:id/accounts",
		async (ctx, reply) => {
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const data = await client.deleteAccountsFromList(
					ctx.params.id,
					(ctx.query as any).account_ids,
				);
				ctx.body = data.data;
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);
}
function escapeHTML(str: string) {
	if (!str) {
		return "";
	}
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}
function nl2br(str: string) {
	if (!str) {
		return "";
	}
	str = str.replace(/\r\n/g, "<br />");
	str = str.replace(/(\n|\r)/g, "<br />");
	return str;
}