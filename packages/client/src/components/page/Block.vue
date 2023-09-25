<template>
	<component
		:is="'x-' + block.type"
		:key="block.id"
		:block="block"
		:hpml="hpml"
		:h="h"
	/>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import XText from "./Text.vue";
import XSection from "./Section.vue";
import XImage from "./Image.vue";
import XButton from "./Button.vue";
import XNumberInput from "./NumberInput.vue";
import XTextInput from "./TextInput.vue";
import XTextareaInput from "./TextareaInput.vue";
import XSwitch from "./Switch.vue";
import XIf from "./If.vue";
import XTextarea from "./Textarea.vue";
import XPost from "./Post.vue";
import XCounter from "./Counter.vue";
import XRadioButton from "./RadioButton.vue";
import XCanvas from "./Canvas.vue";
import XNote from "./Note.vue";
import { Hpml } from "@/scripts/hpml/evaluator";
import { Block } from "@/scripts/hpml/block";

export default defineComponent({
	components: {
		XText,
		XSection,
		XImage,
		XButton,
		XNumberInput,
		XTextInput,
		XTextareaInput,
		XTextarea,
		XPost,
		XSwitch,
		XIf,
		XCounter,
		XRadioButton,
		XCanvas,
		XNote,
	},
	props: {
		block: {
			type: Object as PropType<Block>,
			required: true,
		},
		hpml: {
			type: Object as PropType<Hpml>,
			required: true,
		},
		h: {
			type: Number,
			required: true,
		},
	},
});
</script>
