import config from "@/config/index.js";
import { getUserKeypair } from "@/misc/keypair-store.js";
import type { User } from "@/models/entities/user.js";
import { getResponse } from "../../misc/fetch.js";
import { createSignedPost, createSignedGet } from "./ap-request.js";
import { apLogger } from "@/remote/activitypub/logger.js";

export default async (user: { id: User["id"] }, url: string, object: any) => {
	const body = JSON.stringify(object);

	const keypair = await getUserKeypair(user.id);

	const req = createSignedPost({
		key: {
			privateKeyPem: keypair.privateKey,
			keyId: `${config.url}/users/${user.id}#main-key`,
		},
		url,
		body,
		additionalHeaders: {
			"User-Agent": config.userAgent,
		},
	});

	await getResponse({
		url,
		method: req.request.method,
		headers: req.request.headers,
		body,
	});
};

/**
 * Get AP object with http-signature
 * @param user http-signature user
 * @param url URL to fetch
 * @param redirects whether or not to accept redirects
 */
export async function signedGet(url: string, user: { id: User["id"] }, redirects: boolean = true) {
	apLogger.debug(`Running signedGet on url: ${url}`);
	const keypair = await getUserKeypair(user.id);

	const req = createSignedGet({
		key: {
			privateKeyPem: keypair.privateKey,
			keyId: `${config.url}/users/${user.id}#main-key`,
		},
		url,
		additionalHeaders: {
			"User-Agent": config.userAgent,
		},
	});

	const res = await getResponse({
		url,
		method: req.request.method,
		headers: req.request.headers,
		redirect: redirects ? "manual" : "error"
	});

	if (redirects && [301,302,307,308].includes(res.status)) {
		const newUrl = res.headers.get('location');
		if (!newUrl) throw new Error('signedGet got redirect but no target location');
		apLogger.debug(`signedGet is redirecting to ${newUrl}`);
		return signedGet(newUrl, user, false);
	}

	const contentType = res.headers.get('content-type');
	if (contentType == null || (contentType !== 'application/activity+json' && !contentType.startsWith('application/activity+json;') && contentType !== 'application/ld+json' && !contentType.startsWith('application/ld+json;')))
		throw new Error(`signedGet response had unexpected content-type: ${contentType}`);

	return {
		finalUrl: res.url,
		content: await res.json()
	};
}
