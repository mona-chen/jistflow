<template>
	<XContainer :draggable="true" @remove="() => $emit('remove')">
		<template #header
			><i class="ph-lightning ph-bold ph-lg"></i>
			{{ i18n.ts._pages.blocks.radioButton }}</template
		>

		<section style="padding: 0 16px 16px 16px">
			<Input v-model="value.name"
				><template #prefix
					><i class="ph-magic-wand ph-bold ph-lg"></i></template
				><template #label>{{
					i18n.ts._pages.blocks._radioButton.name
				}}</template></Input
			>
			<Input v-model="value.title"
				><template #label>{{
					i18n.ts._pages.blocks._radioButton.title
				}}</template></Input
			>
			<Textarea v-model="values"
				><template #label>{{
					i18n.ts._pages.blocks._radioButton.values
				}}</template></Textarea
			>
			<Input v-model="value.default"
				><template #label>{{
					i18n.ts._pages.blocks._radioButton.default
				}}</template></Input
			>
		</section>
	</XContainer>
</template>

<script lang="ts" setup>
import { watch } from "vue";
import XContainer from "../Container.vue";
import Textarea from "@/components/form/Textarea.vue";
import Input from "@/components/form/Input.vue";
import { i18n } from "@/i18n";

const props = withDefaults(
	defineProps<{
		value: any;
	}>(),
	{
		value: {
			name: "",
			title: "",
			values: [],
		},
	},
);

let values: string = $ref(props.value.values.join("\n"));

watch(
	values,
	() => {
		props.value.values = values.split("\n");
	},
	{
		deep: true,
	},
);
</script>
