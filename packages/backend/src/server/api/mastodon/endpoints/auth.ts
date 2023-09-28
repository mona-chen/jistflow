import Router from "@koa/router";
import { AuthHelpers } from "@/server/api/mastodon/helpers/auth.js";
import { convertId, IdType } from "@/misc/convert-id.js";

const readScope = [
	"read:account",
	"read:drive",
	"read:blocks",
	"read:favorites",
	"read:following",
	"read:messaging",
	"read:mutes",
	"read:notifications",
	"read:reactions",
	"read:pages",
	"read:page-likes",
	"read:user-groups",
	"read:channels",
	"read:gallery",
	"read:gallery-likes",
];
const writeScope = [
	"write:account",
	"write:drive",
	"write:blocks",
	"write:favorites",
	"write:following",
	"write:messaging",
	"write:mutes",
	"write:notes",
	"write:notifications",
	"write:reactions",
	"write:votes",
	"write:pages",
	"write:page-likes",
	"write:user-groups",
	"write:channels",
	"write:gallery",
	"write:gallery-likes",
];

export function apiAuthMastodon(router: Router): void {
	router.post("/v1/apps", async (ctx) => {
		const body: any = ctx.request.body || ctx.request.query;
		try {
			let scope = body.scopes;
			if (typeof scope === "string") scope = scope.split(" ");
			const pushScope = new Set<string>();
			for (const s of scope) {
				if (s.match(/^read/)) for (const r of readScope) pushScope.add(r);
				if (s.match(/^write/)) for (const r of writeScope) pushScope.add(r);
			}
			const scopeArr = Array.from(pushScope);

			const red = body.redirect_uris;
			const appData = await AuthHelpers.registerApp(body['client_name'], scopeArr, red, body['website']);
			const returns = {
				id: convertId(appData.id, IdType.MastodonId),
				name: appData.name,
				website: body.website,
				redirect_uri: red,
				client_id: Buffer.from(appData.url ?? "").toString("base64"),
				client_secret: appData.clientSecret,
			};
			ctx.body = returns;
		} catch (e: any) {
			console.error(e);
			ctx.status = 401;
			ctx.body = e.response.data;
		}
	});
}
