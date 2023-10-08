import type { Packed } from "./schema.js";
import { Note } from "@/models/entities/note.js";

export function isInstanceMuted(
	note: Packed<"Note"> | Note,
	mutedInstances: Set<string>,
): boolean {
	if (mutedInstances.has(note?.user?.host ?? "")) return true;
	if (mutedInstances.has(note?.reply?.user?.host ?? "")) return true;
	if (mutedInstances.has(note?.renote?.user?.host ?? "")) return true;

	return false;
}

export function isUserFromMutedInstance(
	notif: Packed<"Notification">,
	mutedInstances: Set<string>,
): boolean {
	if (mutedInstances.has(notif?.user?.host ?? "")) return true;

	return false;
}
