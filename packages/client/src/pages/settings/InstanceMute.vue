<template>
	<div class="_formRoot">
		<Info>{{ i18n.ts._instanceMute.title }}</Info>
		<FormTextarea v-model="instanceMutes" class="_formBlock">
			<template #label>{{ i18n.ts._instanceMute.heading }}</template>
			<template #caption
				>{{ i18n.ts._instanceMute.instanceMuteDescription }}<br />{{
					i18n.ts._instanceMute.instanceMuteDescription2
				}}</template
			>
		</FormTextarea>
		<Button primary :disabled="!changed" class="_formBlock" @click="save()"
			><i class="ph-floppy-disk-back ph-bold ph-lg"></i>
			{{ i18n.ts.save }}</Button
		>
	</div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import FormTextarea from "@/components/form/Textarea.vue";
import Info from "@/components/Info.vue";
import Button from "@/components/Button.vue";
import * as os from "@/os";
import { $i } from "@/account";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";

const instanceMutes = ref($i!.mutedInstances.join("\n"));
const changed = ref(false);

async function save() {
	let mutes = instanceMutes.value
		.trim()
		.split("\n")
		.map((el) => el.trim())
		.filter((el) => el);

	await os.api("i/update", {
		mutedInstances: mutes,
	});

	changed.value = false;

	// Refresh filtered list to signal to the user how they've been saved
	instanceMutes.value = mutes.join("\n");
}

watch(instanceMutes, () => {
	changed.value = true;
});

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata({
	title: i18n.ts.instanceMute,
	icon: "ph-speaker-none ph-bold ph-lg",
});
</script>
