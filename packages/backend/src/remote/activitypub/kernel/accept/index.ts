import type { CacheableRemoteUser } from "@/models/entities/user.js";
import { apLogger } from "../../logger.js";
import Resolver from "../../resolver.js";
import type { IAccept } from "../../type.js";
import { getApType, isFollow } from "../../type.js";
import acceptFollow from "./follow.js";

const logger = apLogger;

export default async (
	actor: CacheableRemoteUser,
	activity: IAccept,
): Promise<string> => {
	const uri = activity.id || activity;

	logger.info(`Accept: ${uri}`);

	const resolver = new Resolver();

	const object = await resolver.resolve(activity.object).catch((e) => {
		logger.error(`Resolution failed: ${e}`);
		throw e;
	});

	if (isFollow(object)) return await acceptFollow(actor, object);

	return `skip: Unknown Accept type: ${getApType(object)}`;
};
