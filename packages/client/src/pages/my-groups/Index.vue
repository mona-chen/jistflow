<template>
	<StickyContainer>
		<template #header>
			<PageHeader :actions="headerActions" :display-back-button="true" />
		</template>
		<Spacer :content-max="800" :margin-min="20">
			<Button
				primary
				style="margin: 0 auto var(--margin) auto"
				@click="create"
				><i class="ph-plus ph-bold ph-lg"></i>
				{{ i18n.ts.createGroup }}</Button
			>
			<Pagination
				v-slot="{ items }"
				ref="owned"
				:pagination="ownedPagination"
			>
				<div v-for="group in items" :key="group.id" class="_card">
					<div class="_title">
						<A :to="`/my/groups/${group.id}`" class="_link">{{
							group.name
						}}</A>
					</div>
					<div class="_content">
						<Avatars :user-ids="group.userIds" />
					</div>
				</div>
			</Pagination>
			<Pagination
				v-slot="{ items }"
				ref="joined"
				:pagination="joinedPagination"
			>
				<div v-for="group in items" :key="group.id" class="_card">
					<div class="_title">{{ group.name }}</div>
					<div class="_content">
						<Avatars :user-ids="group.userIds" />
					</div>
					<div class="_footer">
						<Button danger @click="leave(group)">{{
							i18n.ts.leaveGroup
						}}</Button>
					</div>
				</div>
			</Pagination>
		</Spacer>
	</StickyContainer>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import Pagination from "@/components/Pagination.vue";
import Button from "@/components/Button.vue";
import Avatars from "@/components/Avatars.vue";
import * as os from "@/os";
import { definePageMetadata } from "@/scripts/page-metadata";
import { i18n } from "@/i18n";
import StickyContainer from "@/components/global/StickyContainer.vue";

const owned = ref("owned");
const joined = ref("joined");

const ownedPagination = {
	endpoint: "users/groups/owned" as const,
	limit: 10,
};

const joinedPagination = {
	endpoint: "users/groups/joined" as const,
	limit: 10,
};

const headerActions = $computed(() => [
	{
		icon: "ph-plus ph-bold ph-lg",
		text: i18n.ts.createGroup,
		handler: create,
	},
]);

definePageMetadata(
	computed(() => ({
		title: i18n.ts.groups,
		icon: "ph-users-three ph-bold ph-lg",
	})),
);

async function create() {
	const { canceled, result: name } = await os.inputText({
		title: i18n.ts.groupName,
	});
	if (canceled) return;
	await os.api("users/groups/create", { name: name });
	owned.value.reload();
	os.success();
}

async function leave(group) {
	const { canceled } = await os.confirm({
		type: "warning",
		text: i18n.t("leaveGroupConfirm", { name: group.name }),
	});
	if (canceled) return;
	os.apiWithDialog("users/groups/leave", {
		groupId: group.id,
	}).then(() => {
		joined.value.reload();
	});
}
</script>

<style lang="scss" scoped>
._fullinfo {
	display: none !important;
}

._card {
	margin-bottom: 1rem;

	._title {
		font-size: 1.2rem;
		font-weight: bold;
	}

	._content {
		padding: 20px;

		> .defgtij {
			padding: 0;
		}
	}

	._footer {
		display: flex;
		justify-content: flex-end;
	}
}
</style>
