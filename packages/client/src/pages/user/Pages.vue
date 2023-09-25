<template>
	<Spacer :content-max="800">
		<Pagination v-slot="{ items }" ref="list" :pagination="pagination">
			<PagePreview
				v-for="page in items"
				:key="page.id"
				:page="page"
				class="_gap"
			/>
		</Pagination>
	</Spacer>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import * as misskey from "iceshrimp-js";
import PagePreview from "@/components/PagePreview.vue";
import Pagination from "@/components/Pagination.vue";

const props = defineProps<{
	user: misskey.entities.User;
}>();

const pagination = {
	endpoint: "users/pages" as const,
	limit: 20,
	params: computed(() => ({
		userId: props.user.id,
	})),
};
</script>

<style lang="scss" scoped></style>
