import create from "@/services/note/create.js";
import { Users } from "@/models/index.js";
import type { DbUserImportMastoPostJobData } from "@/queue/types.js";
import { queueLogger } from "../../logger.js";
import type Bull from "bull";
import { htmlToMfm } from "@/remote/activitypub/misc/html-to-mfm.js";
import { resolveNote } from "@/remote/activitypub/models/note.js";
import { Note } from "@/models/entities/note.js";
import { uploadFromUrl } from "@/services/drive/upload-from-url.js";
import type { DriveFile } from "@/models/entities/drive-file.js";

const logger = queueLogger.createSubLogger("import-masto-post");

export async function importMastoPost(
	job: Bull.Job<DbUserImportMastoPostJobData>,
	done: any,
): Promise<void> {
	done();
}
