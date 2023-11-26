import { redisClient } from "@/db/redis.js";
import { getTimestamp } from "@/misc/gen-id.js";
import type { Antenna } from "@/models/entities/antenna.js";
import type { Note } from "@/models/entities/note.js";
import type { User } from "@/models/entities/user.js";
import { publishAntennaStream } from "@/services/stream.js";

export async function addNoteToAntenna(
	antenna: Antenna,
	note: Note,
	_noteUser: { id: User["id"] },
) {
	redisClient.xadd(
		`antennaTimeline:${antenna.id}`,
		"MAXLEN",
		"~",
		"200",
		`${getTimestamp(note.id)}-*`,
		"note",
		note.id,
	);

	publishAntennaStream(antenna.id, "note", note);
}
