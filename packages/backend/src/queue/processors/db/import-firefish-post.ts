import * as Post from "@/misc/post.js";
import create from "@/services/note/create.js";
import { Users } from "@/models/index.js";
import type { DbUserImportMastoPostJobData } from "@/queue/types.js";
import { queueLogger } from "../../logger.js";
import type Bull from "bull";

const logger = queueLogger.createSubLogger("import-firefish-post");

export async function importCkPost(
	job: Bull.Job<DbUserImportMastoPostJobData>,
	done: any,
): Promise<void> {
	done();
}
