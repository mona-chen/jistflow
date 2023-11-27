import { User } from "@/models/entities/user.js";
import { Note } from "@/models/entities/note.js";
import { UserProfile } from "@/models/entities/user-profile.js";
import { getWordHardMute } from "@/misc/check-word-mute.js";
import { Cache } from "@/misc/cache.js";
import { unique } from "@/prelude/array.js";
import config from "@/config/index.js";

const filteredNoteCache = new Cache<boolean>("filteredNote", config.wordMuteCache?.ttlSeconds ?? 60 * 60 * 24);

export function isFiltered(note: Note, user: { id: User["id"] } | null | undefined, profile: { mutedWords: UserProfile["mutedWords"] } | null): boolean | Promise<boolean> {
	if (!user || !profile) return false;
	if (profile.mutedWords.length < 1) return false;
	return filteredNoteCache.fetch(`${note.id}:${(note.updatedAt ?? note.createdAt).getTime()}:${user.id}`,
		() => getWordHardMute(note, user, unique(profile.mutedWords)));
}
