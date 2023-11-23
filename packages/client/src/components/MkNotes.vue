<template>
	<MkPagination ref="pagingComponent" :pagination="pagination">
		<template #empty>
			<div class="_fullinfo">
				<img
					:src="instance.images.info"
					class="_ghost"
					alt="Info"
				/>
				<div>{{ i18n.ts.noNotes }}</div>
			</div>
		</template>

		<template #default="{ items: notes }">
			<div class="giivymft" :class="{ noGap }" ref="tlEl">
				<XList
					ref="notes"
					v-slot="{ item: note }"
					:items="notes"
					:direction="pagination.reversed ? 'up' : 'down'"
					:reversed="pagination.reversed"
					:no-gap="noGap"
					class="notes"
				>
					<XNote
						:key="note._featuredId_ || note._prId_ || note.id"
						class="qtqtichx"
						:note="note"
					/>
				</XList>
			</div>
		</template>
	</MkPagination>
</template>

<script lang="ts" setup>
import { onActivated, onDeactivated, onMounted, onUnmounted, ref } from "vue";
import type { Paging } from "@/components/MkPagination.vue";
import XNote from "@/components/MkNote.vue";
import XList from "@/components/MkDateSeparatedList.vue";
import MkPagination from "@/components/MkPagination.vue";
import { i18n } from "@/i18n";
import { scroll } from "@/scripts/scroll";
import {instance} from "@/instance";
import { defaultStore } from "@/store.js";

const tlEl = ref<HTMLElement>();

const props = defineProps<{
	pagination: Paging;
	noGap?: boolean;
}>();

const pagingComponent = ref<InstanceType<typeof MkPagination>>();

const interval = ref<NodeJS.Timer>();
const lastFetchScrollTop = ref(document.documentElement.clientHeight / 2 * -1);

function scrollTop() {
	if (!tlEl.value) return;
	scroll(tlEl.value, { top: 0, behavior: "smooth" });
}

function setTimer() {
	if (interval.value || !defaultStore.state.enableInfiniteScroll) return;
	interval.value = setInterval(() => {
		const viewport = document.documentElement.clientHeight;
		const left = document.documentElement.scrollHeight - document.documentElement.scrollTop;
		if (left > viewport * 3 || document.documentElement.scrollTop - lastFetchScrollTop.value < viewport) return;
		pagingComponent.value.prefetchMore();
		lastFetchScrollTop.value = document.documentElement.scrollTop;
	}, 100);
}

function clearTimer() {
	if (!interval.value) return;
	clearInterval(interval.value);
	interval.value = undefined;
}

onMounted(setTimer);
onActivated(setTimer);
onUnmounted(clearTimer);
onDeactivated(clearTimer);

defineExpose({
	pagingComponent,
	scrollTop,
});
</script>

<style lang="scss" scoped>
.giivymft {
	&.noGap {
		> .notes {
			background: var(--panel) !important;
			border-radius: var(--radius);
		}
	}
	&:not(.noGap) {
		> .notes {
			.qtqtichx {
				background: var(--panel);
				border-radius: var(--radius);
			}
		}
	}
}
</style>
