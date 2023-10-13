import type * as http from "node:http";
import { EventEmitter } from "events";
import type { ParsedUrlQuery } from "querystring";
import * as websocket from "websocket";

import { subscriber as redisClient } from "@/db/redis.js";
import { Users } from "@/models/index.js";
import MainStreamConnection from "./stream/index.js";
import authenticate from "./authenticate.js";
import { apiLogger } from "@/server/api/logger.js";
import { MastodonStreamingConnection } from "@/server/api/mastodon/streaming/index.js";
import { AccessToken } from "@/models/entities/access-token.js";
import { OAuthApp } from "@/models/entities/oauth-app.js";
import { ILocalUser } from "@/models/entities/user.js";
import { getTokenFromOAuth } from "@/server/api/mastodon/middleware/auth.js";
import { OAuthToken } from "@/models/entities/oauth-token.js";

export const streamingLogger = apiLogger.createSubLogger("streaming");

export const initializeStreamingServer = (server: http.Server) => {
	// Init websocket server
	const ws = new websocket.server({
		httpServer: server,
	});

	ws.on("request", async (request) => {
		const q = request.resourceURL.query as ParsedUrlQuery;
		const headers = request.httpRequest.headers["sec-websocket-protocol"] || "";
		const cred = q.i || q.access_token || headers;
		const accessToken = cred.toString();
		const isMastodon = request.resourceURL.pathname?.startsWith('/api/v1/streaming');

		let main: MainStreamConnection | MastodonStreamingConnection;
		let user: ILocalUser | null | undefined;
		let app: AccessToken | null | undefined;
		let token: OAuthToken | null | undefined;

		if (!isMastodon) {
			[user, app] = await authenticate(
				request.httpRequest.headers.authorization,
				accessToken,
			).catch((err) => {
				request.reject(403, err.message);
				return [];
			});

		} else {
			token = await getTokenFromOAuth(accessToken);
			if (!token || !token.user) {
				request.reject(400);
				return;
			}

			user = token.user as ILocalUser;
		}

		if (!user) {
			return;
		}

		if (user?.isSuspended) {
			request.reject(400);
			return;
		}

		const connection = request.accept(request.requestedProtocols[0] ?? undefined);

		const ev = new EventEmitter();

		async function onRedisMessage(_: string, data: string) {
			const parsed = JSON.parse(data);
			ev.emit(parsed.channel, parsed.message);
		}

		redisClient.on("message", onRedisMessage);
		const host = `https://${request.host}`;
		const prepareStream = q.stream?.toString();

		main = isMastodon
			? new MastodonStreamingConnection(connection, ev, user, token, q)
			: new MainStreamConnection(connection, ev, user, app, host, accessToken, prepareStream);

		const intervalId = user
			? setInterval(() => {
					Users.update(user!.id, {
						lastActiveDate: new Date(),
					});
			  }, 1000 * 60 * 5)
			: null;
		if (user) {
			Users.update(user.id, {
				lastActiveDate: new Date(),
			});
		}

		connection.once("close", () => {
			ev.removeAllListeners();
			main.dispose();
			redisClient.off("message", onRedisMessage);
			if (intervalId) clearInterval(intervalId);
		});

		connection.on("message", async (data) => {
			if (data.type === "utf8" && data.utf8Data === "ping") {
				connection.send("pong");
			}
		});
	});
};
