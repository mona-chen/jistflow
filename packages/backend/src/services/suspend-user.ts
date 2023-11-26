import config from "@/config/index.js";
import type { User } from "@/models/entities/user.js";
import { Followings, Users } from "@/models/index.js";
import { deliver } from "@/queue/index.js";
import renderDelete from "@/remote/activitypub/renderer/delete.js";
import { renderActivity } from "@/remote/activitypub/renderer/index.js";
import { publishInternalEvent } from "@/services/stream.js";
import { IsNull, Not } from "typeorm";

export async function doPostSuspend(user: {
	id: User["id"];
	host: User["host"];
}) {
	publishInternalEvent("userChangeSuspendedState", {
		id: user.id,
		isSuspended: true,
	});

	if (Users.isLocalUser(user)) {
		// Send Delete to all known SharedInboxes
		const content = renderActivity(
			renderDelete(`${config.url}/users/${user.id}`, user),
		);

		const queue: string[] = [];

		const followings = await Followings.find({
			where: [
				{ followerSharedInbox: Not(IsNull()) },
				{ followeeSharedInbox: Not(IsNull()) },
			],
			select: ["followerSharedInbox", "followeeSharedInbox"],
		});

		const inboxes = followings.map(
			(x) => x.followerSharedInbox || x.followeeSharedInbox,
		);

		for (const inbox of inboxes) {
			if (inbox != null && !queue.includes(inbox)) queue.push(inbox);
		}

		for (const inbox of queue) {
			deliver(user, content, inbox);
		}
	}
}
