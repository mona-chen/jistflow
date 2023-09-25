<template>
	<Pagination ref="pagingComponent" :pagination="pagination">
		<template #empty>
			<div class="_fullinfo">
				<img :src="instance.images.info" class="_ghost" alt="Info" />
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
	</Pagination>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import type { Paging } from "@/components/Pagination.vue";
import XNote from "@/components/Note.vue";
import XList from "@/components/DateSeparatedList.vue";
import Pagination from "@/components/Pagination.vue";
import { i18n } from "@/i18n";
import { scroll } from "@/scripts/scroll";
import { instance } from "@/instance";

const tlEl = ref<HTMLElement>();

const props = defineProps<{
	pagination: Paging;
	noGap?: boolean;
}>();

const pagingComponent = ref<InstanceType<typeof Pagination>>();

function scrollTop() {
	scroll(tlEl.value, { top: 0, behavior: "smooth" });
}

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
