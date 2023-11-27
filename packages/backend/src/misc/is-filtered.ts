import { User } from "@/models/entities/user.js";
import { Note } from "@/models/entities/note.js";
import { UserProfile } from "@/models/entities/user-profile.js";
import { getWordHardMute } from "@/misc/check-word-mute.js";
import { Cache } from "@/misc/cache.js";
import { unique } from "@/prelude/array.js";
import config from "@/config/index.js";
import { UserProfiles } from "@/models/index.js";

const filteredNoteCache = new Cache<boolean>("filteredNote", config.wordMuteCache?.ttlSeconds ?? 60 * 60 * 24);
const mutedWordsCache = new Cache<UserProfile["mutedWords"]>("mutedWords", 60 * 5);

export async function isFiltered(note: Note, user: { id: User["id"] } | null | undefined, profile?: { mutedWords: UserProfile["mutedWords"] } | null): Promise<boolean> {
	if (!user) return false;
	if (profile === undefined)
		profile = { mutedWords: await mutedWordsCache.fetch(user.id, async () =>
				UserProfiles.findOneBy({ userId: user.id }).then(p => p?.mutedWords ?? [])) };

	if (!profile || profile.mutedWords.length < 1) return false;
	const ts = (note.updatedAt ?? note.createdAt) as Date | string;
	const identifier = (typeof ts === "string" ? new Date(ts) : ts)?.getTime() ?? '0';
	return filteredNoteCache.fetch(`${note.id}:${identifier}:${user.id}`,
		() => getWordHardMute(note, user, unique(profile!.mutedWords)));
}
