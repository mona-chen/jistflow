import config from "@/config/index.js";
import type { MessagingMessage } from "@/models/entities/messaging-message.js";
import type { User } from "@/models/entities/user.js";

export const renderReadActivity = (
	user: { id: User["id"] },
	message: MessagingMessage,
) => ({
	type: "Read",
	actor: `${config.url}/users/${user.id}`,
	object: message.uri,
});
