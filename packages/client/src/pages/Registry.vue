<template>
	<StickyContainer>
		<template #header>
			<PageHeader :actions="headerActions" :tabs="headerTabs" />
		</template>
		<Spacer :content-max="600" :margin-min="16">
			<Button primary @click="createKey">{{
				i18n.ts._registry.createKey
			}}</Button>

			<FormSection v-if="scopes">
				<template #label>{{ i18n.ts.system }}</template>
				<div class="_formLinks">
					<FormLink
						v-for="scope in scopes"
						:to="`/registry/keys/system/${scope.join('/')}`"
						class="_monospace"
						>{{ scope.join("/") }}</FormLink
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

let scopes = $ref(null);

function fetchScopes() {
	os.api("i/registry/scopes").then((res) => {
		scopes = res
			.slice()
			.sort((a, b) => a.join("/").localeCompare(b.join("/")));
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
		},
	});
	if (canceled) return;
	os.apiWithDialog("i/registry/set", {
		scope: result.scope.split("/"),
		key: result.key,
		value: JSON5.parse(result.value),
	}).then(() => {
		fetchScopes();
	});
}

fetchScopes();

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata({
	title: i18n.ts.registry,
	icon: "ph-gear-six ph-bold ph-lg",
});
</script>

<style lang="scss" scoped></style>
