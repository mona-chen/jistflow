<template>
	<XContainer :draggable="true" @remove="() => $emit('remove')">
		<template #header
			><i :class="icon('ph-lightning')"></i>
			{{ i18n.ts._pages.blocks.numberInput }}</template
		>

		<section style="padding: 0 16px 0 16px">
			<MkInput v-model="value.name">
				<template #prefix
					><i :class="icon('ph-magic-wand')"></i
				></template>
				<template #label>{{
					i18n.ts._pages.blocks._numberInput.name
				}}</template>
			</MkInput>
			<MkInput v-model="value.text">
				<template #label>{{
					i18n.ts._pages.blocks._numberInput.text
				}}</template>
			</MkInput>
			<MkInput v-model="value.default" type="number">
				<template #label>{{
					i18n.ts._pages.blocks._numberInput.default
				}}</template>
			</MkInput>
		</section>
	</XContainer>
</template>

<script lang="ts" setup>
import XContainer from "../page-editor.container.vue";
import MkInput from "@/components/form/input.vue";
import { i18n } from "@/i18n";
import icon from "@/scripts/icon";

withDefaults(
	defineProps<{
		value: any;
	}>(),
	{
		value: {
			name: "",
		},
	},
);
</script>
