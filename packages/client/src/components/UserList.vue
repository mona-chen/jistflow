<template>
	<Pagination ref="pagingComponent" :pagination="pagination">
		<template #empty>
			<div class="_fullinfo">
				<img :src="instance.images.info" class="_ghost" alt="Info" />
				<div>{{ i18n.ts.noUsers }}</div>
			</div>
		</template>

		<template #default="{ items: users }">
			<div class="efvhhmdq">
				<UserInfo
					v-for="user in users"
					:key="user.id"
					class="user"
					:user="user"
				/>
			</div>
		</template>
	</Pagination>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import UserInfo from "@/components/UserInfo.vue";
import Pagination, { Paging } from "@/components/Pagination.vue";
import { userPage } from "@/filters/user";
import { i18n } from "@/i18n";
import { instance } from "@/instance";

const props = defineProps<{
	pagination: Paging;
	noGap?: boolean;
}>();

const pagingComponent = ref<InstanceType<typeof Pagination>>();
</script>

<style lang="scss" scoped>
.efvhhmdq {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
	grid-gap: var(--margin);
}
</style>
