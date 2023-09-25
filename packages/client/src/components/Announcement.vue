<template>
	<Modal ref="modal" :z-priority="'middle'" @closed="$emit('closed')">
		<div :class="$style.root">
			<div :class="$style.title">
				<Sparkle v-if="isGoodNews">{{ title }}</Sparkle>
				<p v-else>{{ title }}</p>
			</div>
			<div :class="$style.time">
				<Time :time="announcement.createdAt" />
				<div v-if="announcement.updatedAt">
					{{ i18n.ts.updatedAt }}:
					<Time :time="announcement.createdAt" />
				</div>
			</div>
			<Mfm :text="text" />
			<img
				v-if="imageUrl != null"
				:key="imageUrl"
				:src="imageUrl"
				alt="attached image"
			/>
			<Button :class="$style.gotIt" primary full @click="gotIt()">{{
				i18n.ts.gotIt
			}}</Button>
		</div>
	</Modal>
</template>

<script lang="ts" setup>
import { shallowRef } from "vue";
import Modal from "@/components/Modal.vue";
import Sparkle from "@/components/Sparkle.vue";
import Button from "@/components/Button.vue";
import { i18n } from "@/i18n";
import * as os from "@/os";

const props = defineProps<{
	announcement: Announcement;
}>();

const { id, text, title, imageUrl, isGoodNews } = props.announcement;

const modal = shallowRef<InstanceType<typeof Modal>>();

const gotIt = () => {
	modal.value.close();
	os.api("i/read-announcement", { announcementId: id });
};
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

	> img {
		border-radius: 10px;
		max-height: 100%;
		max-width: 100%;
	}
}

.title {
	font-weight: bold;

	> p {
		margin: 0;
	}
}

.time {
	font-size: 0.8rem;
}

.gotIt {
	margin: 8px 0 0 0;
}
</style>
