import renderUpdate from "@/remote/activitypub/renderer/update.js";
import { renderActivity } from "@/remote/activitypub/renderer/index.js";
import { UserProfiles, Users } from "@/models/index.js";
import type { User } from "@/models/entities/user.js";
import { renderPerson } from "@/remote/activitypub/renderer/person.js";
import { deliverToFollowers } from "@/remote/activitypub/deliver-manager.js";
import { deliverToRelays } from "../relay.js";
import { extractCustomEmojisFromMfm } from "@/misc/extract-custom-emojis-from-mfm.js";
import { extractHashtags } from "@/misc/extract-hashtags.js";
import { normalizeForSearch } from "@/misc/normalize-for-search.js";
import { updateUsertags } from "@/services/update-hashtag.js";
import { publishMainStream, publishUserEvent } from "@/services/stream.js";
import acceptAllFollowRequests from "@/services/following/requests/accept-all.js";
import { UserProfile } from "@/models/entities/user-profile.js";
import mfm from "mfm-js";
import { promiseEarlyReturn } from "@/prelude/promise.js";
import { UserConverter } from "@/server/api/mastodon/converters/user.js";

export async function updateUserProfileData(user: User, profile: UserProfile | null, updates: Partial<User>, profileUpdates: Partial<UserProfile>, isSecure: boolean) {
	if (!profile) profile = await UserProfiles.findOneByOrFail({ userId: user.id });

	let emojis = [] as string[];
	let tags = [] as string[];

	const newName = updates.name === undefined ? user.name : updates.name;
	const newDescription =
		profileUpdates.description === undefined
			? profile.description
			: profileUpdates.description;

	if (newName != null) {
		const tokens = mfm.parseSimple(newName);
		emojis = emojis.concat(extractCustomEmojisFromMfm(tokens!));
	}

	if (newDescription != null) {
		const tokens = mfm.parse(newDescription);
		emojis = emojis.concat(extractCustomEmojisFromMfm(tokens!));
		tags = extractHashtags(tokens!)
			.map((tag) => normalizeForSearch(tag))
			.splice(0, 32);
	}

	updates.emojis = emojis;
	updates.tags = tags;
	updates.updatedAt = new Date();

	updateUsertags(user, tags);

	const oldProfile = await UserProfiles.findOneBy({ userId: user.id });

	if (Object.keys(updates).length > 0) await Users.update(user.id, updates);
	if (Object.keys(profileUpdates).length > 0) {
		await UserProfiles.update(user.id, profileUpdates);
	}

	const iObj = await Users.pack<true, true>(user.id, user, {
		detail: true,
		includeSecrets: isSecure,
	});

	publishMainStream(user.id, "meUpdated", iObj);
	publishUserEvent(
		user.id,
		"updateUserProfile",
		await UserProfiles.findOneByOrFail({ userId: user.id }),
	);

	if (user.isLocked && updates.isLocked === false) {
		acceptAllFollowRequests(user);
	}

	await promiseEarlyReturn(UserProfiles.updateMentions(user.id)
		.finally(() => {
			UserConverter.prewarmCacheById(user.id, oldProfile);
			publishToFollowers(user.id);
		}), 1500);

	return iObj;
}

export async function publishToFollowers(userId: User["id"]) {
	const user = await Users.findOneBy({ id: userId });
	if (user == null) throw new Error("user not found");

	// フォロワーがリモートユーザーかつ投稿者がローカルユーザーならUpdateを配信
	if (Users.isLocalUser(user)) {
		const content = renderActivity(
			renderUpdate(await renderPerson(user), user),
		);
		deliverToFollowers(user, content);
		deliverToRelays(user, content);
	}
}
