<template>
	<XColumn
		:column="column"
		:is-stacked="isStacked"
		@parent-focus="($event) => emit('parent-focus', $event)"
	>
		<template #header
			><i
				:class="icon('ph-envelope-simple-open')"
				style="margin-right: 8px"
			></i
			>{{ column.name }}</template
		>

		<XNotes :pagination="pagination" />
	</XColumn>
</template>

<script lang="ts" setup>
import XColumn from "./column.vue";
import type { Column } from "./deck-store";
import XNotes from "@/components/MkNotes.vue";
import icon from "@/scripts/icon";

defineProps<{
	column: Column;
	isStacked: boolean;
}>();

const emit = defineEmits<{
	(ev: "parent-focus", direction: "up" | "down" | "left" | "right"): void;
}>();

const pagination = {
	endpoint: "notes/mentions" as const,
	limit: 10,
	params: {
		visibility: "specified",
	},
};
</script>
