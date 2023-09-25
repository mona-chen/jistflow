<template>
	<StickyContainer>
		<template #header>
			<PageHeader
				:actions="headerActions"
				:tabs="headerTabs"
				:display-back-button="true"
			/>
		</template>
		<Spacer :content-max="700">
			<div class="qtcaoidl">
				<Pagination
					ref="pagingComponent"
					:pagination="pagination"
					class="list"
				>
					<template #empty>
						<Info :icon="'paperclip'" :card="true">
							<p>{{ i18n.ts.clipsDesc }}</p>
						</Info>
					</template>
					<template #default="{ items }">
						<A
							v-for="item in items"
							:key="item.id"
							:to="`/clips/${item.id}`"
							class="item _panel _gap"
						>
							<b>{{ item.name }}</b>
							<div v-if="item.description" class="description">
								{{ item.description }}
							</div>
						</A>
					</template>
				</Pagination>
			</div>
		</Spacer>
	</StickyContainer>
</template>

<script lang="ts" setup>
import {} from "vue";
import Pagination from "@/components/Pagination.vue";
import Button from "@/components/Button.vue";
import Info from "@/components/Info.vue";
import * as os from "@/os";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";

const pagination = {
	endpoint: "clips/list" as const,
	limit: 10,
};

const pagingComponent = $ref<InstanceType<typeof Pagination>>();

async function create() {
	const { canceled, result } = await os.form(i18n.ts.createNewClip, {
		name: {
			type: "string",
			label: i18n.ts.name,
		},
		description: {
			type: "string",
			required: false,
			multiline: true,
			label: i18n.ts.description,
		},
		isPublic: {
			type: "boolean",
			label: i18n.ts.public,
			default: false,
		},
	});
	if (canceled) return;

	os.apiWithDialog("clips/create", result);

	pagingComponent.reload();
}

function onClipCreated() {
	pagingComponent.reload();
}

function onClipDeleted() {
	pagingComponent.reload();
}

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata({
	title: i18n.ts.clip,
	icon: "ph-paperclip ph-bold ph-lg",
	action: {
		icon: "ph-plus ph-bold ph-lg",
		handler: create,
	},
});
</script>

<style lang="scss" scoped>
.qtcaoidl {
	> .list {
		> .item {
			display: block;
			padding: 16px;

			> .description {
				margin-top: 8px;
				padding-top: 8px;
				border-top: solid 0.5px var(--divider);
			}
		}
	}
}
</style>
