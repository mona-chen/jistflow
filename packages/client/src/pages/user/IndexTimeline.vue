<template>
	<StickyContainer>
		<template #header>
			<Tab v-model="include" :class="$style.tab">
				<option :value="null">{{ i18n.ts.notes }}</option>
				<option value="replies">{{ i18n.ts.notesAndReplies }}</option>
				<option value="files">{{ i18n.ts.withFiles }}</option>
			</Tab>
		</template>
		<XNotes :no-gap="true" :pagination="pagination" />
	</StickyContainer>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import * as misskey from "iceshrimp-js";
import XNotes from "@/components/Notes.vue";
import Tab from "@/components/Tab.vue";
import * as os from "@/os";
import { i18n } from "@/i18n";

const props = defineProps<{
	user: misskey.entities.UserDetailed;
}>();

const include = ref<string | null>(null);

const pagination = {
	endpoint: "users/notes" as const,
	limit: 10,
	params: computed(() => ({
		userId: props.user.id,
		includeReplies: include.value === "replies",
		withFiles: include.value === "files",
	})),
};
</script>

<style lang="scss" module>
.tab {
	margin: calc(var(--margin) / 2) 0;
	padding: calc(var(--margin) / 2) 0;
	background: var(--bg);
}
</style>
