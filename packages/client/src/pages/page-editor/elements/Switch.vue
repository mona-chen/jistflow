<template>
	<XContainer :draggable="true" @remove="() => $emit('remove')">
		<template #header
			><i class="ph-lightning ph-bold ph-lg"></i>
			{{ i18n.ts._pages.blocks.switch }}</template
		>

		<section class="kjuadyyj">
			<Input v-model="value.name"
				><template #prefix
					><i class="ph-magic-wand ph-bold ph-lg"></i></template
				><template #label>{{
					i18n.ts._pages.blocks._switch.name
				}}</template></Input
			>
			<Input v-model="value.text"
				><template #label>{{
					i18n.ts._pages.blocks._switch.text
				}}</template></Input
			>
			<Switch v-model="value.default"
				><span>{{
					i18n.ts._pages.blocks._switch.default
				}}</span></Switch
			>
		</section>
	</XContainer>
</template>

<script lang="ts" setup>
import {} from "vue";
import XContainer from "../Container.vue";
import Switch from "@/components/form/Switch.vue";
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

<style lang="scss" scoped>
.kjuadyyj {
	padding: 0 16px 16px 16px;
}
</style>
