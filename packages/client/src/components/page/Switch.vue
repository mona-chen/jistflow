<template>
	<div class="hkcxmtwj">
		<Switch :model-value="value" @update:modelValue="updateValue($event)">{{
			hpml.interpolate(block.text)
		}}</Switch>
	</div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import Switch from "../form/Switch.vue";
import * as os from "@/os";
import { Hpml } from "@/scripts/hpml/evaluator";
import { SwitchVarBlock } from "@/scripts/hpml/block";

export default defineComponent({
	components: {
		Switch,
	},
	props: {
		block: {
			type: Object as PropType<SwitchVarBlock>,
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

		function updateValue(newValue: boolean) {
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
.hkcxmtwj {
	display: inline-block;
	margin: 16px auto;

	& + .hkcxmtwj {
		margin-left: 16px;
	}
}
</style>
