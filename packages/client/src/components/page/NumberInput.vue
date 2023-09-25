<template>
	<div>
		<Input
			class="kudkigyw"
			:model-value="value"
			type="number"
			@update:modelValue="updateValue($event)"
		>
			<template #label>{{ hpml.interpolate(block.text) }}</template>
		</Input>
	</div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import Input from "../form/Input.vue";
import * as os from "@/os";
import { Hpml } from "@/scripts/hpml/evaluator";
import { NumberInputVarBlock } from "@/scripts/hpml/block";

export default defineComponent({
	components: {
		Input,
	},
	props: {
		block: {
			type: Object as PropType<NumberInputVarBlock>,
			required: true,
		},
		hpml: {
			type: Object as PropType<Hpml>,
			required: true,
		},
	},
	setup(props, ctx) {
		const value = computed(() => {
			return props.hpml.vars.value[props.block.name];
		});

		function updateValue(newValue) {
			props.hpml.updatePageVar(props.block.name, newValue);
			props.hpml.eval();
		}

		return {
			value,
			updateValue,
		};
	},
});
</script>

<style lang="scss" scoped>
.kudkigyw {
	display: inline-block;
	min-width: 300px;
	max-width: 450px;
	margin: 8px 0;
}
</style>
