<template>
	<XContainer :draggable="true" @remove="() => $emit('remove')">
		<template #header
			><i class="ph-paper-plane-tilt ph-bold ph-lg"></i>
			{{ i18n.ts._pages.blocks.post }}</template
		>

		<section style="padding: 16px">
			<Textarea v-model="value.text"
				><template #label>{{
					i18n.ts._pages.blocks._post.text
				}}</template></Textarea
			>
			<Switch v-model="value.attachCanvasImage"
				><span>{{
					i18n.ts._pages.blocks._post.attachCanvasImage
				}}</span></Switch
			>
			<Input v-if="value.attachCanvasImage" v-model="value.canvasId"
				><template #label>{{
					i18n.ts._pages.blocks._post.canvasId
				}}</template></Input
			>
		</section>
	</XContainer>
</template>

<script lang="ts" setup>
import {} from "vue";
import XContainer from "../Container.vue";
import Textarea from "@/components/form/Textarea.vue";
import Input from "@/components/form/Input.vue";
import Switch from "@/components/form/Switch.vue";
import { i18n } from "@/i18n";

withDefaults(
	defineProps<{
		value: any;
	}>(),
	{
		value: {
			text: "",
			attachCanvasImage: false,
			canvasId: "",
		},
	},
);
</script>
