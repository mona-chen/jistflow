<template>
	<XModalWindow
		ref="dialog"
		:width="400"
		:height="450"
		:with-ok-button="true"
		:ok-button-disabled="false"
		@ok="ok()"
		@close="dialog.close()"
		@closed="emit('closed')"
	>
		<template #header>{{ i18n.ts.notificationSetting }}</template>
		<div class="_monolithic_">
			<div v-if="showGlobalToggle" class="_section">
				<Switch v-model="useGlobalSetting">
					{{ i18n.ts.useGlobalSetting }}
					<template #caption>{{
						i18n.ts.useGlobalSettingDesc
					}}</template>
				</Switch>
			</div>
			<div v-if="!useGlobalSetting" class="_section _formRoot">
				<Info class="_formBlock">{{
					i18n.ts.notificationSettingDesc
				}}</Info>
				<Button inline @click="disableAll">{{
					i18n.ts.disableAll
				}}</Button>
				<Button inline @click="enableAll">{{
					i18n.ts.enableAll
				}}</Button>
				<Switch
					v-for="ntype in notificationTypes"
					class="_formBlock"
					:key="ntype"
					v-model="typesMap[ntype]"
					>{{ i18n.t(`_notification._types.${ntype}`) }}</Switch
				>
			</div>
		</div>
	</XModalWindow>
</template>

<script lang="ts" setup>
import {} from "vue";
import { notificationTypes } from "iceshrimp-js";
import Switch from "./form/Switch.vue";
import Info from "./Info.vue";
import Button from "./Button.vue";
import XModalWindow from "@/components/ModalWindow.vue";
import { i18n } from "@/i18n";

const emit = defineEmits<{
	(ev: "done", v: { includingTypes: string[] | null }): void;
	(ev: "closed"): void;
}>();

const props = withDefaults(
	defineProps<{
		includingTypes?: (typeof notificationTypes)[number][] | null;
		showGlobalToggle?: boolean;
	}>(),
	{
		includingTypes: () => [],
		showGlobalToggle: true,
	},
);

let includingTypes = $computed(() => props.includingTypes || []);

const dialog = $ref<InstanceType<typeof XModalWindow>>();

let typesMap = $ref<Record<(typeof notificationTypes)[number], boolean>>({});
let useGlobalSetting = $ref(
	(includingTypes === null || includingTypes.length === 0) &&
		props.showGlobalToggle,
);

for (const ntype of notificationTypes) {
	typesMap[ntype] = includingTypes.includes(ntype);
}

function ok() {
	if (useGlobalSetting) {
		emit("done", { includingTypes: null });
	} else {
		emit("done", {
			includingTypes: (
				Object.keys(typesMap) as (typeof notificationTypes)[number][]
			).filter((type) => typesMap[type]),
		});
	}

	dialog.close();
}

function disableAll() {
	for (const type in typesMap) {
		typesMap[type as (typeof notificationTypes)[number]] = false;
	}
}

function enableAll() {
	for (const type in typesMap) {
		typesMap[type as (typeof notificationTypes)[number]] = true;
	}
}
</script>
