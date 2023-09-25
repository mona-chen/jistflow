<template>
	<XContainer :draggable="true" @remove="() => $emit('remove')">
		<template #header
			><i class="ph-sticker ph-bold ph-lg"></i>
			{{ i18n.ts._pages.blocks.note }}</template
		>

		<section style="padding: 0 16px 0 16px">
			<Input v-model="id">
				<template #label>{{ i18n.ts._pages.blocks._note.id }}</template>
				<template #caption>{{
					i18n.ts._pages.blocks._note.idDescription
				}}</template>
			</Input>
			<Switch v-model="value.detailed"
				><span>{{ i18n.ts._pages.blocks._note.detailed }}</span></Switch
			>

			<XNote
				v-if="note && !value.detailed"
				:key="note.id + ':normal'"
				v-model:note="note"
				style="margin-bottom: 16px"
			/>
			<XNoteDetailed
				v-if="note && value.detailed"
				:key="note.id + ':detail'"
				v-model:note="note"
				style="margin-bottom: 16px"
			/>
		</section>
	</XContainer>
</template>

<script lang="ts" setup>
import { watch } from "vue";
import XContainer from "../Container.vue";
import Input from "@/components/form/Input.vue";
import Switch from "@/components/form/Switch.vue";
import XNote from "@/components/Note.vue";
import XNoteDetailed from "@/components/NoteDetailed.vue";
import * as os from "@/os";
import { i18n } from "@/i18n";

const props = withDefaults(
	defineProps<{
		value: any;
	}>(),
	{
		value: {
			note: null,
			detailed: false,
		},
	},
);

let id: any = $ref(props.value.note);
let note: any = $ref(null);

watch(
	id,
	async () => {
		if (id && (id.startsWith("http://") || id.startsWith("https://"))) {
			props.value.note = (id.endsWith("/") ? id.slice(0, -1) : id)
				.split("/")
				.pop();
		} else {
			props.value.note = id;
		}

		note = await os.api("notes/show", { noteId: props.value.note });
	},
	{
		immediate: true,
	},
);
</script>
