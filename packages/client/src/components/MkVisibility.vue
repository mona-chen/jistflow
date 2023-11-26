<template>
	<span v-if="note.visibility !== 'public'" :class="$style.visibility">
		<i
			v-if="note.visibility === 'home'"
			v-tooltip="i18n.ts._visibility.home"
			:class="icon('ph-house')"
		></i>
		<i
			v-else-if="note.visibility === 'followers'"
			v-tooltip="i18n.ts._visibility.followers"
			:class="icon('ph-lock')"
		></i>
		<i
			v-else-if="note.visibility === 'specified'"
			ref="specified"
			:class="icon('ph-envelope-simple-open')"
		></i>
	</span>
	<span v-if="note.localOnly" :class="$style.localOnly"
		><i
			v-tooltip="i18n.ts._visibility.localOnly"
			:class="icon('ph-users')"
		></i
	></span>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import XDetails from "@/components/MkUsersTooltip.vue";
import * as os from "@/os";
import { useTooltip } from "@/scripts/use-tooltip";
import { i18n } from "@/i18n";
import icon from "@/scripts/icon";

const props = defineProps<{
	note: {
		visibility: string;
		localOnly?: boolean;
		visibleUserIds?: string[];
	};
}>();

const specified = ref<HTMLElement>();

if (props.note.visibility === "specified") {
	useTooltip(specified, async (showing) => {
		const users = await os.api("users/show", {
			userIds: props.note.visibleUserIds,
			limit: 10,
		});

		os.popup(
			XDetails,
			{
				showing,
				users,
				count: props.note.visibleUserIds.length,
				targetElement: specified.value,
			},
			{},
			"closed",
		);
	});
}
</script>

<style lang="scss" module>
.visibility,
.localOnly {
	margin-left: 0.5em;
}
</style>
