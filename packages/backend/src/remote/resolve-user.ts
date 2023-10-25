import { URL } from "node:url";
import chalk from "chalk";
import { IsNull } from "typeorm";
import config from "@/config/index.js";
import type { User, IRemoteUser } from "@/models/entities/user.js";
import { UserProfiles, Users } from "@/models/index.js";
import { toPuny } from "@/misc/convert-host.js";
import webFinger from "./webfinger.js";
import { createPerson, updatePerson } from "./activitypub/models/person.js";
import { remoteLogger } from "./logger.js";
import { Cache } from "@/misc/cache.js";
import { IMentionedRemoteUsers } from "@/models/entities/note.js";
import { UserProfile } from "@/models/entities/user-profile.js";
import { RecursionLimiter } from "@/models/repositories/user-profile.js";
import { promiseEarlyReturn } from "@/prelude/promise.js";

const logger = remoteLogger.createSubLogger("resolve-user");
const uriHostCache = new Cache<string>("resolveUserUriHost", 60 * 60 * 24);
const localUsernameCache = new Cache<string | null>("localUserNameCapitalization", 60 * 60 * 24);
const profileMentionCache = new Cache<ProfileMention | null>("resolveProfileMentions", 60 * 60);

type ProfileMention = {
	user: User;
	profile: UserProfile | null;
	data: {
		username: string;
		host: string | null;
	};
};

type refreshType = 'refresh' | 'refresh-in-background' | 'refresh-timeout-1500ms' | 'no-refresh';

export async function resolveUser(
	username: string,
	host: string | null,
	refresh: refreshType = 'refresh',
	limiter: RecursionLimiter = new RecursionLimiter(20)
): Promise<User> {
	const usernameLower = username.toLowerCase();

	// Return local user if host part is empty

	if (host == null) {
		logger.info(`return local user: ${usernameLower}`);
		return await Users.findOneBy({ usernameLower, host: IsNull() }).then(
			(u) => {
				if (u == null) {
					throw new Error("user not found");
				} else {
					return u;
				}
			},
		);
	}

	host = toPuny(host);

	// Also return local user if host part is specified but referencing the local instance

	if (config.host === host || config.domain === host) {
		logger.info(`return local user: ${usernameLower}`);
		return await Users.findOneBy({ usernameLower, host: IsNull() }).then(
			(u) => {
				if (u == null) {
					throw new Error("user not found");
				} else {
					return u;
				}
			},
		);
	}

	// Check if remote user is already in the database

	let user = (await Users.findOneBy({
		usernameLower,
		host,
	})) as IRemoteUser | null;

	const acctLower = `${usernameLower}@${host}`;

	// If not, look up the user on the remote server

	if (user == null) {
		// Run WebFinger
		const fingerRes = await resolveUserWebFinger(acctLower);
		const finalAcct = subjectToAcct(fingerRes.subject);
		const finalAcctLower = finalAcct.toLowerCase();
		const m = finalAcct.match(/^([^@]+)@(.*)/);
		const subjectHost = m ? m[2] : undefined;

		// If subject is different, we're dealing with a split domain setup (that's already been validated by resolveUserWebFinger)
		if (acctLower != finalAcctLower) {
			logger.info('re-resolving split domain redirect user...');
			const m = finalAcct.match(/^([^@]+)@(.*)/);
			if (m) {
				// Re-check if we already have the user in the database post-redirect
				user = (await Users.findOneBy({
					usernameLower: usernameLower,
					host: subjectHost,
				})) as IRemoteUser | null;

				// If yes, return existing user
				if (user != null) {
					logger.succ(`return existing remote user: ${chalk.magenta(finalAcctLower)}`);
					return user;
				}
				// Otherwise create and return new user
				else {
					logger.succ(`return new remote user: ${chalk.magenta(finalAcctLower)}`);
					return await createPerson(fingerRes.self.href, undefined, subjectHost, limiter);
				}
			}
		}

		// Not a split domain setup, so we can simply create and return the new user
		logger.succ(`return new remote user: ${chalk.magenta(finalAcctLower)}`);
		return await createPerson(fingerRes.self.href, undefined, subjectHost, limiter);
	}

	// If user information is out of date, return it by starting over from WebFinger
	if (
		(refresh === 'refresh' || refresh === 'refresh-timeout-1500ms') && (
			user.lastFetchedAt == null ||
			Date.now() - user.lastFetchedAt.getTime() > 1000 * 60 * 60 * 24
		)
	) {
		// Prevent multiple attempts to connect to unconnected instances, update before each attempt to prevent subsequent similar attempts
		await Users.update(user.id, {
			lastFetchedAt: new Date(),
		});

		logger.info(`try resync: ${acctLower}`);
		const fingerRes = await resolveUserWebFinger(acctLower);

		if (user.uri !== fingerRes.self.href) {
			// if uri mismatch, Fix (user@host <=> AP's Person id(IRemoteUser.uri)) mapping.
			logger.info(`uri missmatch: ${acctLower}`);
			logger.info(
				`recovery mismatch uri for (username=${username}, host=${host}) from ${user.uri} to ${fingerRes.self.href}`,
			);

			// validate uri
			const uri = new URL(fingerRes.self.href);
			if (uri.hostname !== host) {
				throw new Error("Invalid uri");
			}

			await Users.update(
				{
					usernameLower,
					host: host,
				},
				{
					uri: fingerRes.self.href,
				},
			);
		} else {
			logger.info(`uri is fine: ${acctLower}`);
		}

		const finalAcct = subjectToAcct(fingerRes.subject);
		const finalAcctLower = finalAcct.toLowerCase();
		const m = finalAcct.match(/^([^@]+)@(.*)/);
		const finalHost = m ? m[2] : null;

		// Update user.host if we're dealing with an account that's part of a split domain setup that hasn't been fixed yet
		if (m && user.host != finalHost) {
			logger.info(`updating user host to subject acct host: ${user.host} -> ${finalHost}`);
			await Users.update(
				{
					usernameLower,
					host: user.host,
				},
				{
					host: finalHost,
				},
			);
		}

		if (refresh === 'refresh') {
			await updatePerson(fingerRes.self.href);
			logger.info(`return resynced remote user: ${finalAcctLower}`);
		}
		else if (refresh === 'refresh-timeout-1500ms') {
			const res = await promiseEarlyReturn(updatePerson(fingerRes.self.href), 1500);
			logger.info(`return possibly resynced remote user: ${finalAcctLower}`);
		}

		return await Users.findOneBy({ uri: fingerRes.self.href }).then((u) => {
			if (u == null) {
				throw new Error("user not found");
			} else {
				return u;
			}
		});
	} else if (refresh === 'refresh-in-background' && (user.lastFetchedAt == null || Date.now() - user.lastFetchedAt.getTime() > 1000 * 60 * 60 * 24)) {
		// Run the refresh in the background
		// noinspection ES6MissingAwait
		resolveUser(username, host, 'refresh', limiter);
	}

	logger.info(`return existing remote user: ${acctLower}`);
	return user;
}

export async function resolveMentionToUserAndProfile(username: string, host: string | null, objectHost: string | null, limiter: RecursionLimiter) {
	return profileMentionCache.fetch(`${username}@${host ?? objectHost}`, async () => {
		try {
			const user = await resolveUser(username, host ?? objectHost, 'no-refresh', limiter);
			const profile = await UserProfiles.findOneBy({ userId: user.id });
			const data = { username, host: host ?? objectHost };

			return { user, profile, data };
		}
		catch {
			return null;
		}
	});
}

export function getMentionFallbackUri(username: string, host: string | null, objectHost: string | null): string {
	let fallback = `${config.url}/@${username}`;
	if (host !== null && host !== config.domain)
		fallback += `@${host}`;
	else if (objectHost !== null && objectHost !== config.domain && host !== config.domain)
		fallback += `@${objectHost}`;

	return fallback;
}

async function getLocalUsernameCached(username: string): Promise<string | null> {
	return localUsernameCache.fetch(username.toLowerCase(), () =>
		Users.findOneBy({ usernameLower: username.toLowerCase(), host: IsNull() })
			.then(p => p ? p.username : null));
}

export async function resolveMentionFromCache(username: string, host: string | null, objectHost: string | null, cache: IMentionedRemoteUsers): Promise<{ username: string, href: string } | null> {
	const isLocal = (host === null && objectHost === null) || host === config.domain;
	if (isLocal) {
		const finalUsername = await getLocalUsernameCached(username);
		if (finalUsername === null) return null;
		username = finalUsername;
	}

	const fallback = getMentionFallbackUri(username, host, objectHost);
	const cached = cache.find(r => r.username.toLowerCase() === username.toLowerCase() && r.host === (host ?? objectHost));
	const href = cached?.url ?? cached?.uri;
	if (cached && href != null) return { username: cached.username, href: href };
	if (isLocal) return { username: username, href: fallback };
	return null;
}

export async function getSubjectHostFromUri(uri: string): Promise<string | null> {
	try {
		const acct = subjectToAcct((await webFinger(uri)).subject);
		const res = await resolveUserWebFinger(acct.toLowerCase());
		const finalAcct = subjectToAcct(res.subject);
		const m = finalAcct.match(/^([^@]+)@(.*)/);
		if (!m) {
			return null;
		}
		return m[2];
	}
	catch {
		return null;
	}
}

export async function getSubjectHostFromUriAndUsernameCached(uri: string, username: string): Promise<string | null> {
	const url = new URL(uri);
	const hostname = url.hostname;
	username = username.substring(1); // remove leading @ from username

	// This resolves invalid mentions with the URL format https://host.tld/@user@otherhost.tld
	const match = url.pathname.match(/^\/@(?<user>[a-zA-Z0-9_]+|$)@(?<host>[a-zA-Z0-9-.]+\.[a-zA-Z0-9-]+)$/)
	if (match && match.groups?.host) {
		return match.groups.host;
	}

	if (hostname === config.hostname) {
		// user is local, return local account domain
		return config.domain;
	}

	const user = await Users.findOneBy({
		usernameLower: username.toLowerCase(),
		host: hostname
	});

	return user ? user.host : await uriHostCache.fetch(uri, async () => await getSubjectHostFromUri(uri) ?? await getSubjectHostFromAcctParts(username, hostname) ?? hostname);
}

export async function getSubjectHostFromAcct(acct: string): Promise<string | null> {
	try {
		const res = await resolveUserWebFinger(acct.toLowerCase());
		const finalAcct = subjectToAcct(res.subject);
		const m = finalAcct.match(/^([^@]+)@(.*)/);
		if (!m) {
			return null;
		}
		return m[2];
	}
	catch {
		return null;
	}
}


export async function getSubjectHostFromRemoteUser(user: IRemoteUser | undefined): Promise<string | null> {
	return user ? getSubjectHostFromAcct(`${user.username}@${user.host}`) : null;
}

export async function getSubjectHostFromAcctParts(username?: string | undefined, host?: string | undefined): Promise<string | null> {
	return username !== null && host !== null ? getSubjectHostFromAcct(`${username}@${host}`) : null;
}

async function resolveUserWebFinger(acctLower: string, recurse: boolean = true): Promise<{
	subject: string,
	self: {
		href: string;
		rel?: string;
	}
}> {
	logger.info(`WebFinger for ${chalk.yellow(acctLower)}`);
	const fingerRes = await webFinger(acctLower).catch((e) => {
		logger.error(
			`Failed to WebFinger for ${chalk.yellow(acctLower)}: ${
				e.statusCode || e.message
			}`,
		);
		throw new Error(
			`Failed to WebFinger for ${acctLower}: ${e.statusCode || e.message}`,
		);
	});
	const self = fingerRes.links.find(
		(link) => link.rel != null && link.rel.toLowerCase() === "self",
	);
	if (!self) {
		logger.error(
			`Failed to WebFinger for ${chalk.yellow(acctLower)}: self link not found`,
		);
		throw new Error("self link not found");
	}
	if (`${acctToSubject(acctLower)}` !== normalizeSubject(fingerRes.subject)) {
		logger.info(`acct subject mismatch (${acctToSubject(acctLower)} !== ${normalizeSubject(fingerRes.subject)}), possible split domain deployment detected, repeating webfinger`)
		if (!recurse){
			logger.error('split domain verification failed (recurse limit reached), aborting')
			throw new Error('split domain verification failed (recurse limit reached), aborting');
		}
		const initialAcct = subjectToAcct(fingerRes.subject);
		const initialAcctLower = initialAcct.toLowerCase();
		const splitFingerRes = await resolveUserWebFinger(initialAcctLower, false);
		const finalAcct = subjectToAcct(splitFingerRes.subject);
		const finalAcctLower = finalAcct.toLowerCase();
		if (initialAcct !== finalAcct) {
			logger.error('split domain verification failed (subject mismatch), aborting')
			throw new Error('split domain verification failed (subject mismatch), aborting');
		}

		logger.info(`split domain configuration detected: ${acctLower} -> ${finalAcctLower}`);

		return splitFingerRes;
	}

	return {
		subject: fingerRes.subject,
		self: self
	};
}

function subjectToAcct(subject: string): string {
	if (!subject.startsWith('acct:')) {
		logger.error("Subject isnt a valid acct");
		throw ("Subject isnt a valid acct");
	}
	return subject.substring(5);
}

function acctToSubject(acct: string): string {
	return normalizeSubject(`acct:${acct}`);
}

function normalizeSubject(subject: string): string {
	return subject.toLowerCase();
}
