import { createCleanRemoteFilesJob } from "@/queue/index.js";
import define from "@/server/api/define.js";

export const meta = {
	tags: ["admin"],

	requireCredential: true,
	requireModerator: true,
} as const;

export const paramDef = {
	type: "object",
	properties: {},
	required: [],
} as const;

export default define(meta, paramDef, async (ps, me) => {
	createCleanRemoteFilesJob();
});
