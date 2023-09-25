<template>
	<XContainer :draggable="true" @remove="() => $emit('remove')">
		<template #header
			><i class="ph-paint-brush-household ph-bold ph-lg"></i>
			{{ i18n.ts._pages.blocks.canvas }}</template
		>

		<section style="padding: 0 16px 0 16px">
			<Input v-model="value.name">
				<template #prefix
					><i class="ph-magic-wand ph-bold ph-lg"></i
				></template>
				<template #label>{{
					i18n.ts._pages.blocks._canvas.id
				}}</template>
			</Input>
			<Input v-model="value.width" type="number">
				<template #label>{{
					i18n.ts._pages.blocks._canvas.width
				}}</template>
				<template #suffix>px</template>
			</Input>
			<Input v-model="value.height" type="number">
				<template #label>{{
					i18n.ts._pages.blocks._canvas.height
				}}</template>
				<template #suffix>px</template>
			</Input>
		</section>
	</XContainer>
</template>

<script lang="ts" setup>
import {} from "vue";
import XContainer from "../Container.vue";
import Input from "@/components/form/Input.vue";
import { i18n } from "@/i18n";

withDefaults(
	defineProps<{
		value: any;
	}>(),
	{
		value: {
			name: "",
			width: 300,
			height: 200,
		},
	},
);
</script>
