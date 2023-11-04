<template>
	<div class="_formRoot">
		<MkInfo>
			{{ i18n.ts._wellness.description }}
		</MkInfo>
		<FormSection>
			<template #label>{{ i18n.ts._wellness.immediacy }}</template>
			<FormSwitch v-model="newPostsButton" class="_formBlock">{{
					i18n.ts._wellness.newPostsButton
				}}</FormSwitch>
			<FormRange
				v-model="newPostsGlowOpacity"
				:min="0"
				:max="1"
				:step="0.05"
				:text-converter="(v) => `${Math.floor(v * 100)}%`"
				class="_formBlock"
			>
				<template #label>{{ i18n.ts._wellness.newPostsGlowOpacity }}</template>
			</FormRange>
		</FormSection>
	</div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import FormRange from "@/components/form/range.vue";
import { defaultStore } from "@/store";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";
import FormSwitch from "@/components/form/switch.vue";
import MkInfo from "@/components/MkInfo.vue";
import FormSection from "@/components/form/section.vue";

const newPostsButton = computed(
		defaultStore.makeGetterSetter("newPostsButton"),
);

const newPostsGlowOpacity = computed(
		defaultStore.makeGetterSetter("newPostsGlowOpacity"),
);

definePageMetadata({
	title: i18n.ts._wellness.wellness,
	icon: "ph-heart ph-bold ph-lg",
});
</script>
