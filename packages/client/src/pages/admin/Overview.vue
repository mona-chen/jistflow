<template>
	<Spacer :content-max="1000">
		<div ref="rootEl" class="edbbcaef">
			<Folder class="item">
				<template #header>Stats</template>
				<XStats />
			</Folder>

			<Folder class="item">
				<template #header>Active users</template>
				<XActiveUsers />
			</Folder>

			<Folder class="item">
				<template #header>Heatmap</template>
				<XHeatmap />
			</Folder>

			<Folder class="item">
				<template #header>Moderators</template>
				<XModerators />
			</Folder>

			<Folder class="item">
				<template #header>Federation</template>
				<XFederation />
			</Folder>

			<Folder class="item">
				<template #header>Instances</template>
				<XInstances />
			</Folder>

			<Folder class="item">
				<template #header>Fediverse Requests</template>
				<XApRequests />
			</Folder>

			<Folder class="item">
				<template #header>New users</template>
				<XUsers />
			</Folder>

			<Folder class="item">
				<template #header>Deliver queue</template>
				<XQueue domain="deliver" />
			</Folder>

			<Folder class="item">
				<template #header>Inbox queue</template>
				<XQueue domain="inbox" />
			</Folder>

			<!-- <Folder class="item">
				<template #header>Server metrics</template>
				<XMetrics domain="inbox" />
			</Folder> -->
		</div>
	</Spacer>
</template>

<script lang="ts" setup>
import {
	markRaw,
	version as vueVersion,
	onMounted,
	onBeforeUnmount,
	nextTick,
} from "vue";
import XFederation from "./OverviewFederation.vue";
import XInstances from "./OverviewInstances.vue";
import XQueue from "./OverviewQueue.vue";
import XApRequests from "./OverviewApRequests.vue";
import XUsers from "./OverviewUsers.vue";
import XActiveUsers from "./OverviewActiveUsers.vue";
import XStats from "./OverviewStats.vue";
import XModerators from "./OverviewModerators.vue";
import XHeatmap from "./OverviewHeatmap.vue";
// import XMetrics from "./OverviewMetrics.vue";
import TagCloud from "@/components/TagCloud.vue";
import { version, url } from "@/config";
import * as os from "@/os";
import { stream } from "@/stream";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";
import { defaultStore } from "@/store";
import FileListForAdmin from "@/components/FileListForAdmin.vue";
import Folder from "@/components/Folder.vue";

const rootEl = $shallowRef<HTMLElement>();
let serverInfo: any = $ref(null);
let topSubInstancesForPie: any = $ref(null);
let topPubInstancesForPie: any = $ref(null);
let federationPubActive = $ref<number | null>(null);
let federationPubActiveDiff = $ref<number | null>(null);
let federationSubActive = $ref<number | null>(null);
let federationSubActiveDiff = $ref<number | null>(null);
let newUsers = $ref(null);
let activeInstances = $shallowRef(null);
const queueStatsConnection = markRaw(stream.useChannel("queueStats"));
const now = new Date();
const filesPagination = {
	endpoint: "admin/drive/files" as const,
	limit: 9,
	noPaging: true,
};

function onInstanceClick(i) {
	os.pageWindow(`/instance-info/${i.host}`);
}

onMounted(async () => {
	/*
	const magicGrid = new MagicGrid({
		container: rootEl,
		static: true,
		animate: true,
	});

	magicGrid.listen();
	*/

	os.apiGet("charts/federation", { limit: 2, span: "day" }).then((chart) => {
		federationPubActive = chart.pubActive[0];
		federationPubActiveDiff = chart.pubActive[0] - chart.pubActive[1];
		federationSubActive = chart.subActive[0];
		federationSubActiveDiff = chart.subActive[0] - chart.subActive[1];
	});

	os.apiGet("federation/stats", { limit: 10 }).then((res) => {
		topSubInstancesForPie = res.topSubInstances
			.map((x) => ({
				name: x.host,
				color: x.themeColor,
				value: x.followersCount,
				onClick: () => {
					os.pageWindow(`/instance-info/${x.host}`);
				},
			}))
			.concat([
				{
					name: "(other)",
					color: "#80808080",
					value: res.otherFollowersCount,
				},
			]);
		topPubInstancesForPie = res.topPubInstances
			.map((x) => ({
				name: x.host,
				color: x.themeColor,
				value: x.followingCount,
				onClick: () => {
					os.pageWindow(`/instance-info/${x.host}`);
				},
			}))
			.concat([
				{
					name: "(other)",
					color: "#80808080",
					value: res.otherFollowingCount,
				},
			]);
	});

	os.api("admin/server-info").then((serverInfoResponse) => {
		serverInfo = serverInfoResponse;
	});

	os.api("admin/show-users", {
		limit: 5,
		sort: "+createdAt",
	}).then((res) => {
		newUsers = res;
	});

	os.api("federation/instances", {
		sort: "+latestRequestReceivedAt",
		limit: 25,
	}).then((res) => {
		activeInstances = res;
	});

	nextTick(() => {
		queueStatsConnection.send("requestLog", {
			id: Math.random().toString().substr(2, 8),
			length: 100,
		});
	});
});

onBeforeUnmount(() => {
	queueStatsConnection.dispose();
});

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata({
	title: i18n.ts.dashboard,
	icon: "ph-gauge ph-bold ph-lg",
});
</script>

<style lang="scss" scoped>
.edbbcaef {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
	grid-gap: 16px;
}
</style>
