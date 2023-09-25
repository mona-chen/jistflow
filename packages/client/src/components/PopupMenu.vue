<template>
	<Modal
		ref="modal"
		v-slot="{ type, maxHeight }"
		:z-priority="'high'"
		:src="src"
		:transparent-bg="true"
		@click="modal?.close()"
		@closed="emit('closed')"
		tabindex="-1"
	>
		<Menu
			:items="items"
			:align="align"
			:width="width"
			:max-height="maxHeight"
			:as-drawer="type === 'drawer'"
			class="sfhdhdhq"
			:class="{ drawer: type === 'drawer' }"
			:no-return-focus="noReturnFocus"
			@close="modal?.close()"
		/>
	</Modal>
</template>

<script lang="ts" setup>
import {} from "vue";
import Modal from "./Modal.vue";
import Menu from "./Menu.vue";
import { MenuItem } from "@/types/menu";

defineProps<{
	items: MenuItem[];
	align?: "center" | string;
	width?: number;
	viaKeyboard?: boolean;
	src?: any;
	noReturnFocus?;
}>();

const emit = defineEmits<{
	(ev: "closed"): void;
}>();

let modal = $ref<InstanceType<typeof Modal>>();
</script>

<style lang="scss" scoped>
.sfhdhdhq {
	&.drawer {
		border-radius: 24px;
		border-bottom-right-radius: 0;
		border-bottom-left-radius: 0;
	}
}
</style>
