<template>
	<div class="_formRoot">
		<Tab v-model="tab" style="margin-bottom: var(--margin)">
			<option value="mute">{{ i18n.ts.mutedUsers }}</option>
			<option value="block">{{ i18n.ts.blockedUsers }}</option>
		</Tab>
		<div v-if="tab === 'mute'">
			<Pagination :pagination="mutingPagination" class="muting">
				<template #empty>
					<FormInfo>{{ i18n.ts.noUsers }}</FormInfo>
				</template>
				<template #default="{ items }">
					<FormLink
						v-for="mute in items"
						:key="mute.id"
						:to="userPage(mute.mutee)"
					>
						<Acct :user="mute.mutee" />
					</FormLink>
				</template>
			</Pagination>
		</div>
		<div v-if="tab === 'block'">
			<Pagination :pagination="blockingPagination" class="blocking">
				<template #empty>
					<FormInfo>{{ i18n.ts.noUsers }}</FormInfo>
				</template>
				<template #default="{ items }">
					<FormLink
						v-for="block in items"
						:key="block.id"
						:to="userPage(block.blockee)"
					>
						<Acct :user="block.blockee" />
					</FormLink>
				</template>
			</Pagination>
		</div>
	</div>
</template>

<script lang="ts" setup>
import {} from "vue";
import Pagination from "@/components/Pagination.vue";
import Tab from "@/components/Tab.vue";
import FormInfo from "@/components/Info.vue";
import FormLink from "@/components/form/Link.vue";
import { userPage } from "@/filters/user";
import * as os from "@/os";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";

let tab = $ref("mute");

const mutingPagination = {
	endpoint: "mute/list" as const,
	limit: 10,
};

const blockingPagination = {
	endpoint: "blocking/list" as const,
	limit: 10,
};

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata({
	title: i18n.ts.muteAndBlock,
	icon: "ph-prohibit ph-bold ph-lg",
});
</script>
