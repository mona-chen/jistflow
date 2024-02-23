import * as http from "node:http";
import * as https from "node:https";
import type { URL } from "node:url";
import CacheableLookup from "cacheable-lookup";
import fetch from "node-fetch";
import { HttpProxyAgent, HttpsProxyAgent } from "hpagent";
import config from "@/config/index.js";

export async function getJson(
	url: string,
	accept = "application/json, */*",
	timeout = 10000,
	headers?: Record<string, string>,
) {
	const res = await getResponse({
		url,
		method: "GET",
		headers: Object.assign(
			{
				"User-Agent": config.userAgent,
				Accept: accept,
			},
			headers || {},
		),
		timeout,
	});

	return await res.json();
}

export async function getJsonActivity(
	url: string,
	accept = "application/activity+json, application/ld+json; profile=\"https://www.w3.org/ns/activitystreams\"",
	timeout = 10000,
	headers?: Record<string, string>,
) {
	const res = await getResponse({
		url,
		method: "GET",
		headers: Object.assign(
			{
				"User-Agent": config.userAgent,
				Accept: accept,
			},
			headers || {},
		),
		timeout,
	});

	const contentType = res.headers.get('content-type');
	if (contentType == null ||
		(contentType !== 'application/activity+json' && !contentType.startsWith('application/activity+json;') &&
		(!contentType.startsWith('application/ld+json;') || !contentType.includes('profile="https://www.w3.org/ns/activitystreams"')))) {
		throw new Error(`getJsonActivity response had unexpected content-type: ${contentType}`);
	}

	return {
		finalUrl: res.url,
		content: await res.json()
	}
}

export async function getHtml(
	url: string,
	accept = "text/html, */*",
	timeout = 10000,
	headers?: Record<string, string>,
) {
	const res = await getResponse({
		url,
		method: "GET",
		headers: Object.assign(
			{
				"User-Agent": config.userAgent,
				Accept: accept,
			},
			headers || {},
		),
		timeout,
	});

	return await res.text();
}

export async function getResponse(args: {
	url: string;
	method: string;
	body?: string;
	headers: Record<string, string>;
	timeout?: number;
	size?: number;
	redirect?: RequestRedirect;
}) {
	const timeout = args.timeout || 10 * 1000;

	const controller = new AbortController();
	setTimeout(() => {
		controller.abort();
	}, timeout * 6);

	const res = await fetch(args.url, {
		method: args.method,
		headers: args.headers,
		body: args.body,
		timeout,
		size: args.size || 10 * 1024 * 1024,
		agent: getAgentByUrl,
		signal: controller.signal,
		redirect: args.redirect
	});

	if (args.redirect === "manual" && [301,302,307,308].includes(res.status)) {
		return res;
	}

	if (!res.ok) {
		throw new StatusError(
			`${res.status} ${res.statusText}`,
			res.status,
			res.statusText,
		);
	}

	return res;
}

const cache = new CacheableLookup({
	maxTtl: 3600, // 1hours
	errorTtl: 30, // 30secs
	lookup: false, // nativeのdns.lookupにfallbackしない
});

/**
 * Get http non-proxy agent
 */
const _http = new http.Agent({
	keepAlive: true,
	keepAliveMsecs: 30 * 1000,
	lookup: cache.lookup,
} as http.AgentOptions);

/**
 * Get https non-proxy agent
 */
const _https = new https.Agent({
	keepAlive: true,
	keepAliveMsecs: 30 * 1000,
	lookup: cache.lookup,
} as https.AgentOptions);

const maxSockets = Math.max(256, config.deliverJobConcurrency || 128);

/**
 * Get http proxy or non-proxy agent
 */
export const httpAgent = config.proxy
	? new HttpProxyAgent({
			keepAlive: true,
			keepAliveMsecs: 30 * 1000,
			maxSockets,
			maxFreeSockets: 256,
			scheduling: "lifo",
			proxy: config.proxy,
	  })
	: _http;

/**
 * Get https proxy or non-proxy agent
 */
export const httpsAgent = config.proxy
	? new HttpsProxyAgent({
			keepAlive: true,
			keepAliveMsecs: 30 * 1000,
			maxSockets,
			maxFreeSockets: 256,
			scheduling: "lifo",
			proxy: config.proxy,
	  })
	: _https;

/**
 * Get agent by URL
 * @param url URL
 * @param bypassProxy Allways bypass proxy
 */
export function getAgentByUrl(url: URL, bypassProxy = false) {
	if (bypassProxy || (config.proxyBypassHosts || []).includes(url.hostname)) {
		return url.protocol === "http:" ? _http : _https;
	} else {
		return url.protocol === "http:" ? httpAgent : httpsAgent;
	}
}

export class StatusError extends Error {
	public statusCode: number;
	public statusMessage?: string;
	public isClientError: boolean;

	constructor(message: string, statusCode: number, statusMessage?: string) {
		super(message);
		this.name = "StatusError";
		this.statusCode = statusCode;
		this.statusMessage = statusMessage;
		this.isClientError =
			typeof this.statusCode === "number" &&
			this.statusCode >= 400 &&
			this.statusCode < 500;
	}
}
