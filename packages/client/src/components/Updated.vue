<template>
	<Modal
		ref="modal"
		:z-priority="'middle'"
		@click="$refs.modal.close()"
		@closed="$emit('closed')"
	>
		<div :class="$style.root">
			<div :class="$style.title">
				<Sparkle>{{ i18n.ts.iceshrimpUpdated }}</Sparkle>
			</div>
			<div :class="$style.version">✨ {{ version }} 🚀</div>
			<div v-if="newRelease" :class="$style.releaseNotes">
				<Mfm :text="data.notes" />
				<div v-if="data.screenshots.length > 0" style="max-width: 500">
					<img
						v-for="i in data.screenshots"
						:key="i"
						:src="i"
						alt="screenshot"
					/>
				</div>
			</div>
			<Button
				:class="$style.gotIt"
				primary
				full
				@click="$refs.modal.close()"
				>{{ i18n.ts.gotIt }}</Button
			>
		</div>
	</Modal>
</template>

<script lang="ts" setup>
import { shallowRef } from "vue";
import Modal from "@/components/Modal.vue";
import Sparkle from "@/components/Sparkle.vue";
import Button from "@/components/Button.vue";
import { version } from "@/config";
import { i18n } from "@/i18n";
import * as os from "@/os";

const modal = shallowRef<InstanceType<typeof Modal>>();

let newRelease = $ref(false);
let data = $ref(Object);

os.api("release").then((res) => {
	data = res;
	newRelease = version === data?.version;
});

console.log(`Version: ${version}`);
console.log(`Data version: ${data.version}`);
console.log(newRelease);
console.log(data);
</script>

<style lang="scss" module>
.root {
	margin: auto;
	position: relative;
	padding: 32px;
	min-width: 320px;
	max-width: 480px;
	box-sizing: border-box;
	text-align: center;
	background: var(--panel);
	border-radius: var(--radius);
}

.title {
	font-weight: bold;
}

.version {
	margin: 1em 0;
}

.gotIt {
	margin: 8px 0 0 0;
}

.releaseNotes {
	> img {
		border-radius: 10px;
	}
}
</style>
