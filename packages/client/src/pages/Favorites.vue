<template>
	<StickyContainer>
		<template #header>
			<PageHeader />
		</template>
		<Spacer :content-max="800">
			<Pagination ref="pagingComponent" :pagination="pagination">
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

				<template #default="{ items }">
					<XList
						v-slot="{ item }"
						:items="items"
						:direction="'down'"
						:no-gap="false"
					>
						<XNote
							:key="item.id"
							:note="item.note"
							:class="$style.note"
						/>
					</XList>
				</template>
			</Pagination>
		</Spacer>
	</StickyContainer>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import Pagination from "@/components/Pagination.vue";
import XNote from "@/components/Note.vue";
import XList from "@/components/DateSeparatedList.vue";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";
import { instance } from "@/instance";

const pagination = {
	endpoint: "i/favorites" as const,
	limit: 10,
};

const pagingComponent = ref<InstanceType<typeof Pagination>>();

definePageMetadata({
	title: i18n.ts.favorites,
	icon: "ph-bookmark-simple ph-bold ph-lg",
});
</script>

<style lang="scss" module>
.note {
	background: var(--panel);
	border-radius: var(--radius);
}
</style>
