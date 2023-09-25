<template>
	<StickyContainer>
		<template #header>
			<PageHeader
				:actions="headerActions"
				:tabs="headerTabs"
				:display-back-button="true"
			/>
		</template>
		<Spacer :content-max="800" :margin-min="16" :margin-max="32">
			<FormButton primary @click="indexPosts">{{
				i18n.ts.indexPosts
			}}</FormButton>
			<FormSuspense
				v-slot="{ result: database }"
				:p="databasePromiseFactory"
			>
				<KeyValue
					v-for="table in database"
					:key="table[0]"
					oneline
					style="margin: 1em 0"
				>
					<template #key>{{ table[0] }}</template>
					<template #value
						>{{ bytes(table[1].size) }} ({{
							number(table[1].count)
						}}
						recs)</template
					>
				</KeyValue>
			</FormSuspense>
		</Spacer>
	</StickyContainer>
</template>

<script lang="ts" setup>
import {} from "vue";
import FormSuspense from "@/components/form/Suspense.vue";
import FormButton from "@/components/Button.vue";
import KeyValue from "@/components/KeyValue.vue";
import * as os from "@/os";
import bytes from "@/filters/bytes";
import number from "@/filters/number";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";
import { indexPosts } from "@/scripts/index-posts";

const databasePromiseFactory = () =>
	os
		.api("admin/get-table-stats")
		.then((res) =>
			Object.entries(res).sort((a, b) => b[1].size - a[1].size),
		);

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata({
	title: i18n.ts.database,
	icon: "ph-database ph-bold ph-lg",
});
</script>
