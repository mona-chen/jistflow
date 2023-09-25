<template>
	<StickyContainer>
		<template #header>
			<PageHeader
				v-model:tab="tab"
				:actions="headerActions"
				:tabs="headerTabs"
				:display-back-button="true"
			/>
		</template>
		<Spacer :content-max="800">
			<XQueue v-if="tab === 'deliver'" domain="deliver" />
			<XQueue v-else-if="tab === 'inbox'" domain="inbox" />
		</Spacer>
	</StickyContainer>
</template>

<script lang="ts" setup>
import { markRaw, onMounted, onBeforeUnmount, nextTick } from "vue";
import XQueue from "./QueueChart.vue";
import Button from "@/components/Button.vue";
import * as os from "@/os";
import * as config from "@/config";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";

let tab = $ref("deliver");

function clear() {
	os.confirm({
		type: "warning",
		title: i18n.ts.clearQueueConfirmTitle,
		text: i18n.ts.clearQueueConfirmText,
	}).then(({ canceled }) => {
		if (canceled) return;

		os.apiWithDialog("admin/queue/clear");
	});
}

const headerActions = $computed(() => [
	{
		asFullButton: true,
		icon: "ph-arrow-square-up-right ph-bold ph-lg",
		text: i18n.ts.dashboard,
		handler: () => {
			window.open(config.url + "/queue", "_blank");
		},
	},
]);

const headerTabs = $computed(() => [
	{
		key: "deliver",
		title: "Deliver",
		icon: "ph-upload ph-bold ph-lg",
	},
	{
		key: "inbox",
		title: "Inbox",
		icon: "ph-download ph-bold ph-lg",
	},
]);

definePageMetadata({
	title: i18n.ts.jobQueue,
	icon: "ph-queue ph-bold ph-lg",
});
</script>
