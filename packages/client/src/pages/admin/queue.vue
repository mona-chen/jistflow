<template>
	<MkStickyContainer>
		<template #header
			><MkPageHeader
				v-model:tab="tab"
				:actions="headerActions"
				:tabs="headerTabs"
				:display-back-button="true"
		/></template>
		<MkSpacer :content-max="800">
			<XQueue v-if="tab === 'deliver'" domain="deliver" />
			<XQueue v-else-if="tab === 'inbox'" domain="inbox" />
		</MkSpacer>
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import XQueue from "./queue.chart.vue";
import * as config from "@/config";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";
import icon from "@/scripts/icon";

const tab = ref("deliver");

const headerActions = computed(() => [
	{
		asFullButton: true,
		icon: `${icon("ph-arrow-square-up-right")}`,
		text: i18n.ts.dashboard,
		handler: () => {
			window.open(config.url + "/queue", "_blank");
		},
	},
]);

const headerTabs = computed(() => [
	{
		key: "deliver",
		title: "Deliver",
		icon: `${icon("ph-upload")}`,
	},
	{
		key: "inbox",
		title: "Inbox",
		icon: `${icon("ph-download")}`,
	},
]);

definePageMetadata({
	title: i18n.ts.jobQueue,
	icon: `${icon("ph-queue")}`,
});
</script>
