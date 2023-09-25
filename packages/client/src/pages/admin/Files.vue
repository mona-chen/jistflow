<template>
	<div>
		<StickyContainer>
			<template #header>
				<PageHeader :actions="headerActions" />
			</template>
			<Spacer :content-max="900">
				<div class="xrmjdkdw">
					<div>
						<div
							class="inputs"
							style="
								display: flex;
								gap: var(--margin);
								flex-wrap: wrap;
							"
						>
							<Select v-model="origin" style="margin: 0; flex: 1">
								<template #label>{{
									i18n.ts.instance
								}}</template>
								<option value="combined">
									{{ i18n.ts.all }}
								</option>
								<option value="local">
									{{ i18n.ts.local }}
								</option>
								<option value="remote">
									{{ i18n.ts.remote }}
								</option>
							</Select>
							<Input
								v-model="searchHost"
								:debounce="true"
								type="search"
								style="margin: 0; flex: 1"
								:disabled="pagination.params.origin === 'local'"
							>
								<template #label>{{ i18n.ts.host }}</template>
							</Input>
						</div>
						<div
							class="inputs"
							style="
								display: flex;
								gap: var(--margin);
								flex-wrap: wrap;
								padding-top: 1.2em;
							"
						>
							<Input
								v-model="userId"
								:debounce="true"
								type="search"
								style="margin: 0; flex: 1"
							>
								<template #label>User ID</template>
							</Input>
							<Input
								v-model="type"
								:debounce="true"
								type="search"
								style="margin: 0; flex: 1"
							>
								<template #label>MIME type</template>
							</Input>
						</div>
						<FileListForAdmin
							:pagination="pagination"
							:view-mode="viewMode"
						/>
					</div>
				</div>
			</Spacer>
		</StickyContainer>
	</div>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent } from "vue";
import * as Acct from "iceshrimp-js/built/acct";
import Button from "@/components/Button.vue";
import Input from "@/components/form/Input.vue";
import Select from "@/components/form/Select.vue";
import FileListForAdmin from "@/components/FileListForAdmin.vue";
import { lookupFile } from "@/scripts/lookup-file";
import * as os from "@/os";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";

let origin = $ref("local");
let type = $ref(null);
let searchHost = $ref("");
let userId = $ref("");
let viewMode = $ref("grid");
const pagination = {
	endpoint: "admin/drive/files" as const,
	limit: 10,
	params: computed(() => ({
		type: type && type !== "" ? type : null,
		userId: userId && userId !== "" ? userId : null,
		origin: origin,
		hostname: searchHost && searchHost !== "" ? searchHost : null,
	})),
};

function clear() {
	os.confirm({
		type: "warning",
		text: i18n.ts.clearCachedFilesConfirm,
	}).then(({ canceled }) => {
		if (canceled) return;

		os.apiWithDialog("admin/drive/clean-remote-files", {});
	});
}

const headerActions = $computed(() => [
	{
		text: i18n.ts.lookup,
		icon: "ph-magnifying-glass ph-bold ph-lg",
		handler: lookupFile,
	},
	{
		text: i18n.ts.clearCachedFiles,
		icon: "ph-trash ph-bold ph-lg",
		handler: clear,
	},
]);

const headerTabs = $computed(() => []);

definePageMetadata(
	computed(() => ({
		title: i18n.ts.files,
		icon: "ph-cloud ph-bold ph-lg",
	})),
);
</script>

<style lang="scss" scoped>
.xrmjdkdw {
	margin: var(--margin);
}
</style>
