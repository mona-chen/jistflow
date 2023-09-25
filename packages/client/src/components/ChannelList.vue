<template>
	<Pagination :pagination="pagination">
		<template #empty>
			<div class="_fullinfo">
				<img
					:src="instance.images.notFound"
					class="_ghost"
					:alt="i18n.ts.notFound"
				/>
				<div>{{ i18n.ts.notFound }}</div>
			</div>
		</template>

		<template #default="{ items }">
			<ChannelPreview
				v-for="item in items"
				:key="item.id"
				class="_margin"
				:channel="extractor(item)"
			/>
		</template>
	</Pagination>
</template>

<script lang="ts" setup>
import ChannelPreview from "@/components/ChannelPreview.vue";
import type { Paging } from "@/components/Pagination.vue";
import Pagination from "@/components/Pagination.vue";
import { i18n } from "@/i18n";
import { instance } from "@/instance";

const props = withDefaults(
	defineProps<{
		pagination: Paging;
		noGap?: boolean;
		extractor?: (item: any) => any;
	}>(),
	{
		extractor: (item) => item,
	},
);
</script>

<style lang="scss" scoped></style>
