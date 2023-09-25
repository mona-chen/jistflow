<template>
	<XContainer :draggable="true" @remove="() => $emit('remove')">
		<template #header
			><i class="ph-lightning ph-bold ph-lg"></i>
			{{ i18n.ts._pages.blocks.textareaInput }}</template
		>

		<section style="padding: 0 16px 16px 16px">
			<Input v-model="value.name"
				><template #prefix
					><i class="ph-magic-wand ph-bold ph-lg"></i></template
				><template #label>{{
					i18n.ts._pages.blocks._textareaInput.name
				}}</template></Input
			>
			<Input v-model="value.text"
				><template #label>{{
					i18n.ts._pages.blocks._textareaInput.text
				}}</template></Input
			>
			<Textarea v-model="value.default"
				><template #label>{{
					i18n.ts._pages.blocks._textareaInput.default
				}}</template></Textarea
			>
		</section>
	</XContainer>
</template>

<script lang="ts" setup>
import {} from "vue";
import XContainer from "../Container.vue";
import Textarea from "@/components/form/Textarea.vue";
import Input from "@/components/form/Input.vue";
import { i18n } from "@/i18n";

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
