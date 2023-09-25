<template>
	<VueDraggable
		v-model="blocks"
		tag="div"
		handle=".drag-handle"
		:group="{ name: 'blocks' }"
		animation="150"
		swap-threshold="0.5"
	>
		<component
			v-for="element in blocks"
			:key="element"
			:is="'x-' + element.type"
			:value="element"
			:hpml="hpml"
			@update:value="updateItem"
			@remove="() => removeItem(element)"
		/>
	</VueDraggable>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent } from "vue";
import { VueDraggable } from "vue-draggable-plus";
import XSection from "./elements/Section.vue";
import XText from "./elements/Text.vue";
import XTextarea from "./elements/Textarea.vue";
import XImage from "./elements/Image.vue";
import XButton from "./elements/Button.vue";
import XTextInput from "./elements/TextInput.vue";
import XTextareaInput from "./elements/TextareaInput.vue";
import XNumberInput from "./elements/NumberInput.vue";
import XSwitch from "./elements/Switch.vue";
import XIf from "./elements/If.vue";
import XPost from "./elements/Post.vue";
import XCounter from "./elements/Counter.vue";
import XRadioButton from "./elements/RadioButton.vue";
import XCanvas from "./elements/Canvas.vue";
import XNote from "./elements/Note.vue";
import * as os from "@/os";

export default defineComponent({
	components: {
		VueDraggable,
		XSection,
		XText,
		XImage,
		XButton,
		XTextarea,
		XTextInput,
		XTextareaInput,
		XNumberInput,
		XSwitch,
		XIf,
		XPost,
		XCounter,
		XRadioButton,
		XCanvas,
		XNote,
	},

	props: {
		modelValue: {
			type: Array,
			required: true,
		},
		hpml: {
			required: true,
		},
	},

	emits: ["update:modelValue"],

	computed: {
		blocks: {
			get() {
				return this.modelValue;
			},
			set(value) {
				this.$emit("update:modelValue", value);
			},
		},
	},

	methods: {
		updateItem(v) {
			const i = this.blocks.findIndex((x) => x.id === v.id);
			const newValue = [
				...this.blocks.slice(0, i),
				v,
				...this.blocks.slice(i + 1),
			];
			this.$emit("update:modelValue", newValue);
		},

		removeItem(el) {
			const i = this.blocks.findIndex((x) => x.id === el.id);
			const newValue = [
				...this.blocks.slice(0, i),
				...this.blocks.slice(i + 1),
			];
			this.$emit("update:modelValue", newValue);
		},
	},
});
</script>
