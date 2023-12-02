import { AbuseUserReports, Users } from "@/models/index.js";
import { deliver } from "@/queue/index.js";
import { renderFlag } from "@/remote/activitypub/renderer/flag.js";
import { renderActivity } from "@/remote/activitypub/renderer/index.js";
import define from "@/server/api/define.js";
import { getInstanceActor } from "@/services/instance-actor.js";

export const meta = {
	tags: ["admin"],

	requireCredential: true,
	requireModerator: true,
} as const;

export const paramDef = {
	type: "object",
	properties: {
		reportId: { type: "string", format: "misskey:id" },
		forward: { type: "boolean", default: false },
	},
	required: ["reportId"],
} as const;

export default define(meta, paramDef, async (ps, me) => {
	const report = await AbuseUserReports.findOneByOrFail({ id: ps.reportId });

	if (report == null) {
		throw new Error("report not found");
	}

	if (ps.forward && report.targetUserHost != null) {
		const actor = await getInstanceActor();
		const targetUser = await Users.findOneByOrFail({ id: report.targetUserId });

		deliver(
			actor,
			renderActivity(renderFlag(actor, [targetUser.uri!], report.comment)),
			targetUser.inbox,
		);
	}

	await AbuseUserReports.update(report.id, {
		resolved: true,
		assigneeId: me.id,
		forwarded: ps.forward && report.targetUserHost != null,
	});
});
