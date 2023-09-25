<template>
	<StickyContainer>
		<template #header>
			<PageHeader :actions="headerActions" :tabs="headerTabs" />
		</template>
		<Spacer :content-max="600" :margin-min="16">
			<FormInfo warn>{{
				i18n.ts.editTheseSettingsMayBreakAccount
			}}</FormInfo>

			<template v-if="value">
				<FormSplit>
					<KeyValue class="_formBlock">
						<template #key>{{ i18n.ts._registry.domain }}</template>
						<template #value>{{ i18n.ts.system }}</template>
					</KeyValue>
					<KeyValue class="_formBlock">
						<template #key>{{ i18n.ts._registry.scope }}</template>
						<template #value>{{ scope.join("/") }}</template>
					</KeyValue>
					<KeyValue class="_formBlock">
						<template #key>{{ i18n.ts._registry.key }}</template>
						<template #value>{{ key }}</template>
					</KeyValue>
				</FormSplit>

				<FormTextarea
					v-model="valueForEditor"
					tall
					class="_formBlock _monospace"
				>
					<template #label>{{ i18n.ts.value }} (JSON)</template>
				</FormTextarea>

				<Button class="_formBlock" primary @click="save"
					><i class="ph-floppy-disk-back ph-bold ph-lg"></i>
					{{ i18n.ts.save }}</Button
				>

				<KeyValue class="_formBlock">
					<template #key>{{ i18n.ts.updatedAt }}</template>
					<template #value
						><Time :time="value.updatedAt" mode="detail"
					/></template>
				</KeyValue>

				<Button danger @click="del"
					><i class="ph-trash ph-bold ph-lg"></i>
					{{ i18n.ts.delete }}</Button
				>
			</template>
		</Spacer>
	</StickyContainer>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import JSON5 from "json5";
import * as os from "@/os";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";
import FormLink from "@/components/form/Link.vue";
import FormSection from "@/components/form/Section.vue";
import Button from "@/components/Button.vue";
import KeyValue from "@/components/KeyValue.vue";
import FormTextarea from "@/components/form/Textarea.vue";
import FormSplit from "@/components/form/Split.vue";
import FormInfo from "@/components/Info.vue";

const props = defineProps<{
	path: string;
}>();

const scope = $computed(() => props.path.split("/").slice(0, -1));
const key = $computed(() => props.path.split("/").at(-1));

let value = $ref(null);
let valueForEditor = $ref(null);

function fetchValue() {
	os.api("i/registry/get-detail", {
		scope,
		key,
	}).then((res) => {
		value = res;
		valueForEditor = JSON5.stringify(res.value, null, "\t");
	});
}

async function save() {
	try {
		JSON5.parse(valueForEditor);
	} catch (err) {
		os.alert({
			type: "error",
			text: i18n.ts.invalidValue,
		});
		return;
	}
	os.confirm({
		type: "warning",
		text: i18n.ts.saveConfirm,
	}).then(({ canceled }) => {
		if (canceled) return;
		os.apiWithDialog("i/registry/set", {
			scope,
			key,
			value: JSON5.parse(valueForEditor),
		});
	});
}

function del() {
	os.confirm({
		type: "warning",
		text: i18n.ts.deleteConfirm,
	}).then(({ canceled }) => {
		if (canceled) return;
		os.apiWithDialog("i/registry/remove", {
			scope,
			key,
		});
	});
}

watch(() => props.path, fetchValue, { immediate: true });

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata({
	title: i18n.ts.registry,
	icon: "ph-gear-six ph-bold ph-lg",
});
</script>

<style lang="scss" scoped></style>
