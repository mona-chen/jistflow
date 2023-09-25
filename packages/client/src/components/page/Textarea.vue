<template>
	<Textarea :model-value="text" readonly></Textarea>
</template>

<script lang="ts" setup>
import { watch } from "vue";
import Textarea from "../form/Textarea.vue";
import { TextBlock } from "@/scripts/hpml/block";
import { Hpml } from "@/scripts/hpml/evaluator";

const props = defineProps<{
	block: TextBlock;
	hpml: Hpml;
}>();

let text = $ref("");

watch(
	props.hpml.vars,
	() => {
		text = props.hpml.interpolate(props.block.text) as string;
	},
	{
		deep: true,
		immediate: true,
	},
);
</script>
