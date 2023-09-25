<template>
	<div>
		<StickyContainer>
			<template #header>
				<PageHeader
					:actions="headerActions"
					:tabs="headerTabs"
					:display-back-button="true"
				/>
			</template>
			<Spacer :content-max="900">
				<XFederation />
			</Spacer>
		</StickyContainer>
	</div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { definePageMetadata } from "@/scripts/page-metadata";
import { i18n } from "@/i18n";
import XFederation from "@/pages/AboutFederation.vue";

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata(
	computed(() => ({
		title: i18n.ts.federation,
		icon: "ph-planet ph-bold ph-lg",
	})),
);
</script>
