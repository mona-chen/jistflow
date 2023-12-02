import type { DbJobData } from "@/queue/types.js";
import type Bull from "bull";
import { deleteAccount } from "./delete-account.js";
import { deleteDriveFiles } from "./delete-drive-files.js";
import { exportBlocking } from "./export-blocking.js";
import { exportCustomEmojis } from "./export-custom-emojis.js";
import { exportFollowing } from "./export-following.js";
import { exportMute } from "./export-mute.js";
import { exportNotes } from "./export-notes.js";
import { exportUserLists } from "./export-user-lists.js";
import { importBlocking } from "./import-blocking.js";
import { importCustomEmojis } from "./import-custom-emojis.js";
import { importCkPost } from "./import-firefish-post.js";
import { importFollowing } from "./import-following.js";
import { importMastoPost } from "./import-masto-post.js";
import { importMuting } from "./import-muting.js";
import { importPosts } from "./import-posts.js";
import { importUserLists } from "./import-user-lists.js";

const jobs = {
	deleteDriveFiles,
	exportCustomEmojis,
	exportNotes,
	exportFollowing,
	exportMute,
	exportBlocking,
	exportUserLists,
	importFollowing,
	importMuting,
	importBlocking,
	importUserLists,
	importPosts,
	importMastoPost,
	importCkPost,
	importCustomEmojis,
	deleteAccount,
} as Record<
	string,
	| Bull.ProcessCallbackFunction<DbJobData>
	| Bull.ProcessPromiseFunction<DbJobData>
>;

export default function (dbQueue: Bull.Queue<DbJobData>) {
	for (const [k, v] of Object.entries(jobs)) {
		dbQueue.process(k, v);
	}
}
