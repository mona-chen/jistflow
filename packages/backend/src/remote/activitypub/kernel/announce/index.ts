import type { CacheableRemoteUser } from "@/models/entities/user.js";
import { apLogger } from "../../logger.js";
import Resolver from "../../resolver.js";
import type { IAnnounce } from "../../type.js";
import { getApId } from "../../type.js";
import announceNote from "./note.js";

const logger = apLogger;

export default async (
	actor: CacheableRemoteUser,
	activity: IAnnounce,
): Promise<void> => {
	const uri = getApId(activity);

	logger.info(`Announce: ${uri}`);

	const resolver = new Resolver();

	const targetUri = getApId(activity.object);

	announceNote(resolver, actor, activity, targetUri);
};
