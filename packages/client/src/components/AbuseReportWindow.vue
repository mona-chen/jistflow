<template>
	<XWindow
		ref="uiWindow"
		:initial-width="400"
		:initial-height="500"
		:can-resize="true"
		@closed="emit('closed')"
	>
		<template #header>
			<i
				class="ph-warning-circle ph-bold ph-lg"
				style="margin-right: 0.5em"
			></i>
			<I18n :src="i18n.ts.reportAbuseOf" tag="span">
				<template #name>
					<b>
						<Acct :user="user" />
					</b>
				</template>
			</I18n>
		</template>
		<div class="dpvffvvy _monolithic_">
			<div class="_section">
				<Textarea v-model="comment">
					<template #label>{{ i18n.ts.details }}</template>
					<template #caption>{{
						i18n.ts.fillAbuseReportDescription
					}}</template>
				</Textarea>
			</div>
			<div class="_section">
				<Button
					primary
					full
					:disabled="comment.length === 0"
					@click="send"
					>{{ i18n.ts.send }}</Button
				>
			</div>
		</div>
	</XWindow>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type * as Misskey from "iceshrimp-js";
import XWindow from "@/components/Window.vue";
import Textarea from "@/components/form/Textarea.vue";
import Button from "@/components/Button.vue";
import * as os from "@/os";
import { i18n } from "@/i18n";

const props = defineProps<{
	user: Misskey.entities.User;
	initialComment?: string;
}>();

const emit = defineEmits<{
	(ev: "closed"): void;
}>();

const uiWindow = ref<InstanceType<typeof XWindow>>();
const comment = ref(props.initialComment || "");

function send() {
	os.apiWithDialog(
		"users/report-abuse",
		{
			userId: props.user.id,
			comment: comment.value,
		},
		undefined,
	).then((res) => {
		os.alert({
			type: "success",
			text: i18n.ts.abuseReported,
		});
		uiWindow.value?.close();
		emit("closed");
	});
}
</script>

<style lang="scss" scoped>
.dpvffvvy {
	--root-margin: 16px;
}
</style>
