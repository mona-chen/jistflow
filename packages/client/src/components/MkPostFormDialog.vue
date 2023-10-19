<template>
	<MkModal
		ref="modal"
		:prefer-type="'dialog'"
		@click="modal.close()"
		@closed="onModalClosed()"
	>
		<MkPostForm
			ref="form"
			style="margin: 0 auto auto auto"
			v-bind="props"
			autofocus
			freeze-after-posted
			@posted="onPosted"
			@cancel="modal.close()"
			@esc="modal.close()"
		/>
	</MkModal>
</template>

<script lang="ts" setup>
import { shallowRef } from "vue";

import type * as firefish from "firefish-js";
import MkModal from "@/components/MkModal.vue";
import MkPostForm from "@/components/MkPostForm.vue";

const props = defineProps<{
	reply?: firefish.entities.Note;
	renote?: firefish.entities.Note;
	channel?: any; // TODO
	mention?: firefish.entities.User;
	specified?: firefish.entities.User;
	initialText?: string;
	initialVisibility?: typeof firefish.noteVisibilities;
	initialFiles?: firefish.entities.DriveFile[];
	initialLocalOnly?: boolean;
	initialVisibleUsers?: firefish.entities.User[];
	initialNote?: firefish.entities.Note;
	instant?: boolean;
	fixed?: boolean;
	autofocus?: boolean;
	editId?: firefish.entities.Note["id"];
}>();

const emit = defineEmits<{
	(ev: "closed"): void;
}>();

const modal = shallowRef<InstanceType<typeof MkModal>>();
const form = shallowRef<InstanceType<typeof MkPostForm>>();

function onPosted() {
	modal.value.close({
		useSendAnimation: true,
	});
}

function onModalClosed() {
	emit("closed");
}
</script>
