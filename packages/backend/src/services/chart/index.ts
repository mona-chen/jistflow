import { beforeShutdown } from "@/misc/before-shutdown.js";

import ActiveUsersChart from "./charts/active-users.js";
import ApRequestChart from "./charts/ap-request.js";
import DriveChart from "./charts/drive.js";
import FederationChart from "./charts/federation.js";
import HashtagChart from "./charts/hashtag.js";
import InstanceChart from "./charts/instance.js";
import NotesChart from "./charts/notes.js";
import PerUserDriveChart from "./charts/per-user-drive.js";
import PerUserFollowingChart from "./charts/per-user-following.js";
import PerUserNotesChart from "./charts/per-user-notes.js";
import PerUserReactionsChart from "./charts/per-user-reactions.js";
import UsersChart from "./charts/users.js";

export const federationChart = new FederationChart();
export const notesChart = new NotesChart();
export const usersChart = new UsersChart();
export const activeUsersChart = new ActiveUsersChart();
export const instanceChart = new InstanceChart();
export const perUserNotesChart = new PerUserNotesChart();
export const driveChart = new DriveChart();
export const perUserReactionsChart = new PerUserReactionsChart();
export const hashtagChart = new HashtagChart();
export const perUserFollowingChart = new PerUserFollowingChart();
export const perUserDriveChart = new PerUserDriveChart();
export const apRequestChart = new ApRequestChart();

const charts = [
	federationChart,
	notesChart,
	usersChart,
	activeUsersChart,
	instanceChart,
	perUserNotesChart,
	driveChart,
	perUserReactionsChart,
	hashtagChart,
	perUserFollowingChart,
	perUserDriveChart,
	apRequestChart,
];

// 20分おきにメモリ情報をDBに書き込み
setInterval(() => {
	for (const chart of charts) {
		chart.save();
	}
}, 1000 * 60 * 20);

beforeShutdown(() => Promise.all(charts.map((chart) => chart.save())));
