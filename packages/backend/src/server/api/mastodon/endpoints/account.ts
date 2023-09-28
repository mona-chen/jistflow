import Router from "@koa/router";
import { getClient } from "../ApiMastodonCompatibleService.js";
import { argsToBools, convertPaginationArgsIds, limitToInt, normalizeUrlQuery } from "./timeline.js";
import { convertId, IdType } from "../../index.js";
import { convertAccount, convertFeaturedTag, convertList, convertRelationship, convertStatus, } from "../converters.js";
import { getUser } from "@/server/api/common/getters.js";
import { UserConverter } from "@/server/api/mastodon/converters/user.js";
import authenticate from "@/server/api/authenticate.js";
import { NoteConverter } from "@/server/api/mastodon/converters/note.js";
import { UserHelpers } from "@/server/api/mastodon/helpers/user.js";
import { PaginationHelpers } from "@/server/api/mastodon/helpers/pagination.js";
import { NotificationHelpers } from "@/server/api/mastodon/helpers/notification.js";

const relationshipModel = {
	id: "",
	following: false,
	followed_by: false,
	delivery_following: false,
	blocking: false,
	blocked_by: false,
	muting: false,
	muting_notifications: false,
	requested: false,
	domain_blocking: false,
	showing_reblogs: false,
	endorsed: false,
	notifying: false,
	note: "",
};

export function apiAccountMastodon(router: Router): void {
	router.get("/v1/accounts/verify_credentials", async (ctx) => {
		const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
		const accessTokens = ctx.headers.authorization;
		const client = getClient(BASE_URL, accessTokens);
		try {
			const data = await client.verifyAccountCredentials();
			let acct = data.data;
			acct.id = convertId(acct.id, IdType.MastodonId);
			acct.display_name = acct.display_name || acct.username;
			acct.url = `${BASE_URL}/@${acct.url}`;
			acct.note = acct.note || "";
			acct.avatar_static = acct.avatar;
			acct.header = acct.header || "/static-assets/transparent.png";
			acct.header_static = acct.header || "/static-assets/transparent.png";
			acct.source = {
				note: acct.note,
				fields: acct.fields,
				privacy: await client.getDefaultPostPrivacy(),
				sensitive: false,
				language: "",
			};
			console.log(acct);
			ctx.body = acct;
		} catch (e: any) {
			console.error(e);
			console.error(e.response.data);
			ctx.status = 401;
			ctx.body = e.response.data;
		}
	});
	router.patch("/v1/accounts/update_credentials", async (ctx) => {
		const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
		const accessTokens = ctx.headers.authorization;
		const client = getClient(BASE_URL, accessTokens);
		try {
			const data = await client.updateCredentials(
				(ctx.request as any).body as any,
			);
			ctx.body = convertAccount(data.data);
		} catch (e: any) {
			console.error(e);
			console.error(e.response.data);
			ctx.status = 401;
			ctx.body = e.response.data;
		}
	});
	router.get("/v1/accounts/lookup", async (ctx) => {
		try {
			const args = normalizeUrlQuery(ctx.query);
			const user = await UserHelpers.getUserFromAcct(args.acct);
			if (user === null) {
				ctx.status = 404;
				return;
			}
			const account = await UserConverter.encode(user);
			ctx.body = convertAccount(account);
		} catch (e: any) {
			console.error(e);
			console.error(e.response.data);
			ctx.status = 401;
			ctx.body = e.response.data;
		}
	});
	router.get("/v1/accounts/relationships", async (ctx) => {
		let users;
		try {
			const auth = await authenticate(ctx.headers.authorization, null);
			const user = auth[0] ?? null;

			if (!user) {
				ctx.status = 401;
				return;
			}

			const ids = (normalizeUrlQuery(ctx.query, ['id[]'])['id[]'] ?? [])
				.map((id: string) => convertId(id, IdType.IceshrimpId));
			const result = await UserHelpers.getUserRelationhipToMany(ids, user.id);
			ctx.body = result.map(rel => convertRelationship(rel));
		} catch (e: any) {
			console.error(e);
			let data = e.response.data;
			data.users = users;
			console.error(data);
			ctx.status = 401;
			ctx.body = data;
		}
	});
	router.get<{ Params: { id: string } }>("/v1/accounts/:id", async (ctx) => {
		try {
			const userId = convertId(ctx.params.id, IdType.IceshrimpId);
			const account = await UserConverter.encode(await getUser(userId));
			ctx.body = convertAccount(account);
		} catch (e: any) {
			console.error(e);
			console.error(e.response.data);
			ctx.status = 401;
			ctx.body = e.response.data;
		}
	});
	router.get<{ Params: { id: string } }>(
		"/v1/accounts/:id/statuses",
		async (ctx) => {
			try {
				const auth = await authenticate(ctx.headers.authorization, null);
				const user = auth[0] ?? null;

				const userId = convertId(ctx.params.id, IdType.IceshrimpId);
				const cache = UserHelpers.getFreshAccountCache();
				const query = await UserHelpers.getUserCached(userId, cache);
				const args = normalizeUrlQuery(convertPaginationArgsIds(argsToBools(limitToInt(ctx.query))));
				const tl = await UserHelpers.getUserStatuses(query, user, args.max_id, args.since_id, args.min_id, args.limit, args.only_media, args.exclude_replies, args.exclude_reblogs, args.pinned, args.tagged)
					.then(n => NoteConverter.encodeMany(n, user, cache));

				ctx.body = tl.map(s => convertStatus(s));
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);
	router.get<{ Params: { id: string } }>(
		"/v1/accounts/:id/featured_tags",
		async (ctx) => {
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const data = await client.getAccountFeaturedTags(
					convertId(ctx.params.id, IdType.IceshrimpId),
				);
				ctx.body = data.data.map((tag) => convertFeaturedTag(tag));
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);
	router.get<{ Params: { id: string } }>(
		"/v1/accounts/:id/followers",
		async (ctx) => {
			try {
				const auth = await authenticate(ctx.headers.authorization, null);
				const user = auth[0] ?? null;

				const userId = convertId(ctx.params.id, IdType.IceshrimpId);
				const cache = UserHelpers.getFreshAccountCache();
				const query = await UserHelpers.getUserCached(userId, cache);
				const args = normalizeUrlQuery(convertPaginationArgsIds(limitToInt(ctx.query as any)));

				const res = await UserHelpers.getUserFollowers(query, user, args.max_id, args.since_id, args.min_id, args.limit);
				const followers = await UserConverter.encodeMany(res.data, cache);

				ctx.body = followers.map((account) => convertAccount(account));
				PaginationHelpers.appendLinkPaginationHeader(args, ctx, res);
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);
	router.get<{ Params: { id: string } }>(
		"/v1/accounts/:id/following",
		async (ctx) => {
			try {
				const auth = await authenticate(ctx.headers.authorization, null);
				const user = auth[0] ?? null;

				const userId = convertId(ctx.params.id, IdType.IceshrimpId);
				const cache = UserHelpers.getFreshAccountCache();
				const query = await UserHelpers.getUserCached(userId, cache);
				const args = normalizeUrlQuery(convertPaginationArgsIds(limitToInt(ctx.query as any)));

				const res = await UserHelpers.getUserFollowing(query, user, args.max_id, args.since_id, args.min_id, args.limit);
				const following = await UserConverter.encodeMany(res.data, cache);

				ctx.body = following.map((account) => convertAccount(account));
				PaginationHelpers.appendLinkPaginationHeader(args, ctx, res);
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);
	router.get<{ Params: { id: string } }>(
		"/v1/accounts/:id/lists",
		async (ctx) => {
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const data = await client.getAccountLists(
					convertId(ctx.params.id, IdType.IceshrimpId),
				);
				ctx.body = data.data.map((list) => convertList(list));
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);
	router.post<{ Params: { id: string } }>(
		"/v1/accounts/:id/follow",
		async (ctx) => {
			try {
				const auth = await authenticate(ctx.headers.authorization, null);
				const user = auth[0] ?? null;

				if (!user) {
					ctx.status = 401;
					return;
				}

				const target = await UserHelpers.getUserCached(convertId(ctx.params.id, IdType.IceshrimpId));
				//FIXME: Parse form data
				const result = await UserHelpers.followUser(target, user, true, false);
				ctx.body = convertRelationship(result);
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);
	router.post<{ Params: { id: string } }>(
		"/v1/accounts/:id/unfollow",
		async (ctx) => {
			try {
				const auth = await authenticate(ctx.headers.authorization, null);
				const user = auth[0] ?? null;

				if (!user) {
					ctx.status = 401;
					return;
				}

				const target = await UserHelpers.getUserCached(convertId(ctx.params.id, IdType.IceshrimpId));
				const result = await UserHelpers.unfollowUser(target, user);
				ctx.body = convertRelationship(result);
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);
	router.post<{ Params: { id: string } }>(
		"/v1/accounts/:id/block",
		async (ctx) => {
			try {
				const auth = await authenticate(ctx.headers.authorization, null);
				const user = auth[0] ?? null;

				if (!user) {
					ctx.status = 401;
					return;
				}

				const target = await UserHelpers.getUserCached(convertId(ctx.params.id, IdType.IceshrimpId));
				const result = await UserHelpers.blockUser(target, user);
				ctx.body = convertRelationship(result);
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);
	router.post<{ Params: { id: string } }>(
		"/v1/accounts/:id/unblock",
		async (ctx) => {
			try {
				const auth = await authenticate(ctx.headers.authorization, null);
				const user = auth[0] ?? null;

				if (!user) {
					ctx.status = 401;
					return;
				}

				const target = await UserHelpers.getUserCached(convertId(ctx.params.id, IdType.IceshrimpId));
				const result = await UserHelpers.unblockUser(target, user);
				ctx.body = convertRelationship(result)
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);
	router.post<{ Params: { id: string } }>(
		"/v1/accounts/:id/mute",
		async (ctx) => {
			try {
				const auth = await authenticate(ctx.headers.authorization, null);
				const user = auth[0] ?? null;

				if (!user) {
						ctx.status = 401;
						return;
				}

				//FIXME: parse form data
				const args = normalizeUrlQuery(argsToBools(limitToInt(ctx.query, ['duration']), ['notifications']));
				const target = await UserHelpers.getUserCached(convertId(ctx.params.id, IdType.IceshrimpId));
				const result = await UserHelpers.muteUser(target, user, args.notifications, args.duration);
				ctx.body = convertRelationship(result)
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);
	router.post<{ Params: { id: string } }>(
		"/v1/accounts/:id/unmute",
		async (ctx) => {
			try {
				const auth = await authenticate(ctx.headers.authorization, null);
				const user = auth[0] ?? null;

				if (!user) {
					ctx.status = 401;
					return;
				}

				const target = await UserHelpers.getUserCached(convertId(ctx.params.id, IdType.IceshrimpId));
				const result = await UserHelpers.unmuteUser(target, user);
				ctx.body = convertRelationship(result)
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);
	router.get("/v1/featured_tags", async (ctx) => {
		const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
		const accessTokens = ctx.headers.authorization;
		const client = getClient(BASE_URL, accessTokens);
		try {
			const data = await client.getFeaturedTags();
			ctx.body = data.data.map((tag) => convertFeaturedTag(tag));
		} catch (e: any) {
			console.error(e);
			console.error(e.response.data);
			ctx.status = 401;
			ctx.body = e.response.data;
		}
	});
	router.get("/v1/followed_tags", async (ctx) => {
		const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
		const accessTokens = ctx.headers.authorization;
		const client = getClient(BASE_URL, accessTokens);
		try {
			const data = await client.getFollowedTags();
			ctx.body = data.data;
		} catch (e: any) {
			console.error(e);
			console.error(e.response.data);
			ctx.status = 401;
			ctx.body = e.response.data;
		}
	});
	router.get("/v1/bookmarks", async (ctx) => {
		try {
			const auth = await authenticate(ctx.headers.authorization, null);
			const user = auth[0] ?? null;

			if (!user) {
				ctx.status = 401;
				return;
			}

			const cache = UserHelpers.getFreshAccountCache();
			const args = normalizeUrlQuery(convertPaginationArgsIds(limitToInt(ctx.query as any)));
			const res = await UserHelpers.getUserBookmarks(user, args.max_id, args.since_id, args.min_id, args.limit);
			const bookmarks = await NoteConverter.encodeMany(res.data, user, cache);

			ctx.body = bookmarks.map(s => convertStatus(s));
			PaginationHelpers.appendLinkPaginationHeader(args, ctx, res);
		} catch (e: any) {
			console.error(e);
			console.error(e.response.data);
			ctx.status = 401;
			ctx.body = e.response.data;
		}
	});
	router.get("/v1/favourites", async (ctx) => {
		try {
			const auth = await authenticate(ctx.headers.authorization, null);
			const user = auth[0] ?? null;

			if (!user) {
				ctx.status = 401;
				return;
			}

			const cache = UserHelpers.getFreshAccountCache();
			const args = normalizeUrlQuery(convertPaginationArgsIds(limitToInt(ctx.query as any)));
			const res = await UserHelpers.getUserFavorites(user, args.max_id, args.since_id, args.min_id, args.limit);
			const favorites = await NoteConverter.encodeMany(res.data, user, cache);

			ctx.body = favorites.map(s => convertStatus(s));
			PaginationHelpers.appendLinkPaginationHeader(args, ctx, res);
		} catch (e: any) {
			console.error(e);
			console.error(e.response.data);
			ctx.status = 401;
			ctx.body = e.response.data;
		}
	});
	router.get("/v1/mutes", async (ctx) => {
		try {
			const auth = await authenticate(ctx.headers.authorization, null);
			const user = auth[0] ?? null;

			if (!user) {
				ctx.status = 401;
				return;
			}

			const cache = UserHelpers.getFreshAccountCache();
			const args = normalizeUrlQuery(convertPaginationArgsIds(limitToInt(ctx.query as any)));
			const res = await UserHelpers.getUserMutes(user, args.max_id, args.since_id, args.min_id, args.limit, cache);
			ctx.body = res.data.map(m => convertAccount(m));
			PaginationHelpers.appendLinkPaginationHeader(args, ctx, res);
		} catch (e: any) {
			console.error(e);
			console.error(e.response.data);
			ctx.status = 401;
			ctx.body = e.response.data;
		}
	});
	router.get("/v1/blocks", async (ctx) => {
		try {
			const auth = await authenticate(ctx.headers.authorization, null);
			const user = auth[0] ?? null;

			if (!user) {
				ctx.status = 401;
				return;
			}

			const cache = UserHelpers.getFreshAccountCache();
			const args = normalizeUrlQuery(convertPaginationArgsIds(limitToInt(ctx.query as any)));
			const res = await UserHelpers.getUserBlocks(user, args.max_id, args.since_id, args.min_id, args.limit);
			const blocks = await UserConverter.encodeMany(res.data, cache);
			ctx.body = blocks.map(b => convertAccount(b));
			PaginationHelpers.appendLinkPaginationHeader(args, ctx, res);
		} catch (e: any) {
			console.error(e);
			console.error(e.response.data);
			ctx.status = 401;
			ctx.body = e.response.data;
		}
	});
	router.get("/v1/follow_requests", async (ctx) => {
		try {
			const auth = await authenticate(ctx.headers.authorization, null);
			const user = auth[0] ?? null;

			if (!user) {
				ctx.status = 401;
				return;
			}

			const cache = UserHelpers.getFreshAccountCache();
			const args = normalizeUrlQuery(convertPaginationArgsIds(limitToInt(ctx.query as any)));
			const res = await UserHelpers.getUserFollowRequests(user, args.max_id, args.since_id, args.min_id, args.limit);
			const requests = await UserConverter.encodeMany(res.data, cache);
			ctx.body = requests.map(b => convertAccount(b));
			PaginationHelpers.appendLinkPaginationHeader(args, ctx, res);
		} catch (e: any) {
			console.error(e);
			console.error(e.response.data);
			ctx.status = 401;
			ctx.body = e.response.data;
		}
	});
	router.post<{ Params: { id: string } }>(
		"/v1/follow_requests/:id/authorize",
		async (ctx) => {
			try {
				const auth = await authenticate(ctx.headers.authorization, null);
				const user = auth[0] ?? null;

				if (!user) {
					ctx.status = 401;
					return;
				}

				const target = await UserHelpers.getUserCached(convertId(ctx.params.id, IdType.IceshrimpId));
				const result = await UserHelpers.acceptFollowRequest(target, user);
				ctx.body = convertRelationship(result);
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);
	router.post<{ Params: { id: string } }>(
		"/v1/follow_requests/:id/reject",
		async (ctx) => {
			try {
				const auth = await authenticate(ctx.headers.authorization, null);
				const user = auth[0] ?? null;

				if (!user) {
					ctx.status = 401;
					return;
				}

				const target = await UserHelpers.getUserCached(convertId(ctx.params.id, IdType.IceshrimpId));
				const result = await UserHelpers.rejectFollowRequest(target, user);
				ctx.body = convertRelationship(result);
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);
}
