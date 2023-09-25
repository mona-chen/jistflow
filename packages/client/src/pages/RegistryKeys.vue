<template>
	<StickyContainer>
		<template #header>
			<PageHeader :actions="headerActions" :tabs="headerTabs" />
		</template>
		<Spacer :content-max="600" :margin-min="16">
			<FormSplit>
				<KeyValue class="_formBlock">
					<template #key>{{ i18n.ts._registry.domain }}</template>
					<template #value>{{ i18n.ts.system }}</template>
				</KeyValue>
				<KeyValue class="_formBlock">
					<template #key>{{ i18n.ts._registry.scope }}</template>
					<template #value>{{ scope.join("/") }}</template>
				</KeyValue>
			</FormSplit>

			<Button primary @click="createKey">{{
				i18n.ts._registry.createKey
			}}</Button>

			<FormSection v-if="keys">
				<template #label>{{ i18n.ts.keys }}</template>
				<div class="_formLinks">
					<FormLink
						v-for="key in keys"
						:to="`/registry/value/system/${scope.join('/')}/${
							key[0]
						}`"
						class="_monospace"
						>{{ key[0]
						}}<template #suffix>{{
							key[1].toUpperCase()
						}}</template></FormLink
					>
				</div>
			</FormSection>
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
import FormSplit from "@/components/form/Split.vue";

const props = defineProps<{
	path: string;
}>();

const scope = $computed(() => props.path.split("/"));

let keys = $ref(null);

function fetchKeys() {
	os.api("i/registry/keys-with-type", {
		scope: scope,
	}).then((res) => {
		keys = Object.entries(res).sort((a, b) => a[0].localeCompare(b[0]));
	});
}

async function createKey() {
	const { canceled, result } = await os.form(i18n.ts._registry.createKey, {
		key: {
			type: "string",
			label: i18n.ts._registry.key,
		},
		value: {
			type: "string",
			multiline: true,
			label: i18n.ts.value,
		},
		scope: {
			type: "string",
			label: i18n.ts._registry.scope,
			default: scope.join("/"),
		},
	});
	if (canceled) return;
	os.apiWithDialog("i/registry/set", {
		scope: result.scope.split("/"),
		key: result.key,
		value: JSON5.parse(result.value),
	}).then(() => {
		fetchKeys();
	});
}

watch(() => props.path, fetchKeys, { immediate: true });

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata({
	title: i18n.ts.registry,
	icon: "ph-gear-six ph-bold ph-lg",
});
</script>

<style lang="scss" scoped></style>
