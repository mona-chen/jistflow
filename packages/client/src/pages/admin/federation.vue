<template>
	<div>
		<MkStickyContainer>
			<template #header
				><MkPageHeader
					:actions="headerActions"
					:tabs="headerTabs"
					:display-back-button="true"
			/></template>
			<MkSpacer :content-max="900">
				<XFederation />
			</MkSpacer>
		</MkStickyContainer>
	</div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { definePageMetadata } from "@/scripts/page-metadata";
import { i18n } from "@/i18n";
import XFederation from "@/pages/about.federation.vue";
import icon from "@/scripts/icon";

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePageMetadata(
	computed(() => ({
		title: i18n.ts.federation,
		icon: `${icon("ph-planet")}`,
	})),
);
</script>
