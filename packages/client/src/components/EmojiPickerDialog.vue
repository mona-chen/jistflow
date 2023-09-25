<template>
	<Modal
		ref="modal"
		v-slot="{ type, maxHeight }"
		:z-priority="'middle'"
		:prefer-type="
			asReactionPicker &&
			defaultStore.state.reactionPickerUseDrawerForMobile === false
				? 'popup'
				: 'auto'
		"
		:transparent-bg="true"
		:manual-showing="manualShowing"
		:src="src"
		@click="checkForShift"
		@opening="opening"
		@close="emit('close')"
		@closed="emit('closed')"
	>
		<EmojiPicker
			ref="picker"
			class="ryghynhb _popup _shadow"
			:class="{ drawer: type === 'drawer' }"
			:show-pinned="showPinned"
			:as-reaction-picker="asReactionPicker"
			:as-drawer="type === 'drawer'"
			:max-height="maxHeight"
			@chosen="chosen"
		/>
	</Modal>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import Modal from "@/components/Modal.vue";
import EmojiPicker from "@/components/EmojiPicker.vue";
import { defaultStore } from "@/store";

withDefaults(
	defineProps<{
		manualShowing?: boolean | null;
		src?: HTMLElement;
		showPinned?: boolean;
		asReactionPicker?: boolean;
	}>(),
	{
		manualShowing: null,
		showPinned: true,
		asReactionPicker: false,
	},
);

const emit = defineEmits<{
	(ev: "done", v: any): void;
	(ev: "close"): void;
	(ev: "closed"): void;
}>();

const modal = ref<InstanceType<typeof Modal>>();
const picker = ref<InstanceType<typeof EmojiPicker>>();

function checkForShift(ev?: MouseEvent) {
	if (ev?.shiftKey) return;
	modal.value?.close(ev);
}

function chosen(emoji: any, ev: MouseEvent) {
	emit("done", emoji);
	checkForShift(ev);
}

function opening() {
	try {
		picker.value?.reset();
	} catch (e) {
		console.error("Something's wrong with resetting the emoji picker", e);
	}
	picker.value?.focus();
}
</script>

<style lang="scss" scoped>
.ryghynhb {
	&.drawer {
		border-radius: 24px;
		border-bottom-right-radius: 0;
		border-bottom-left-radius: 0;
	}
}
</style>
