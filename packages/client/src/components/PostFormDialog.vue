<template>
	<Modal
		ref="modal"
		:prefer-type="'dialog'"
		@click="modal.close()"
		@closed="onModalClosed()"
	>
		<PostForm
			ref="form"
			style="margin: 0 auto auto auto"
			v-bind="props"
			autofocus
			freeze-after-posted
			@posted="onPosted"
			@cancel="modal.close()"
			@esc="modal.close()"
		/>
	</Modal>
</template>

<script lang="ts" setup>
import {} from "vue";
import * as misskey from "iceshrimp-js";
import Modal from "@/components/Modal.vue";
import PostForm from "@/components/PostForm.vue";

const props = defineProps<{
	reply?: misskey.entities.Note;
	renote?: misskey.entities.Note;
	channel?: any; // TODO
	mention?: misskey.entities.User;
	specified?: misskey.entities.User;
	initialText?: string;
	initialVisibility?: typeof misskey.noteVisibilities;
	initialFiles?: misskey.entities.DriveFile[];
	initialLocalOnly?: boolean;
	initialVisibleUsers?: misskey.entities.User[];
	initialNote?: misskey.entities.Note;
	instant?: boolean;
	fixed?: boolean;
	autofocus?: boolean;
	editId?: misskey.entities.Note["id"];
}>();

const emit = defineEmits<{
	(ev: "closed"): void;
}>();

let modal = $shallowRef<InstanceType<typeof Modal>>();
let form = $shallowRef<InstanceType<typeof PostForm>>();

function onPosted() {
	modal.close({
		useSendAnimation: true,
	});
}

function onModalClosed() {
	emit("closed");
}
</script>
