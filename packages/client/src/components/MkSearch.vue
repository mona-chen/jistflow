<script setup lang="ts">
import { i18n } from "@/i18n.js";
import MkInput from "@/components/form/input.vue";
import * as os from "@/os.js";
import XSearchFilterDialog from "@/components/MkSearchFilterDialog.vue";
import { onActivated, onMounted, onUnmounted, ref, toRefs } from "vue";
import * as Acct from "iceshrimp-js/built/acct";

const props = defineProps<{
	query: string;
}>();

const emit = defineEmits<{
	(ev: "query", v: string): void;
}>();

const query = ref(props.query);
const input = ref<typeof MkInput>();

onActivated(() => {
	query.value = props.query;
	input.value!.focus();
});

function formatDateToYYYYMMDD(date) {
	const year = date.getFullYear();
	const month = ("0" + (date.getMonth() + 1)).slice(-2);
	const day = ("0" + (date.getDate() + 1)).slice(-2);
	return `${year}-${month}-${day}`;
}

function appendSearchFilter(filter: string, trailingSpace: boolean = true) {
	if (query.value.length > 0 && query.value.at(query.value.length - 1) !== " ") query.value += " ";
	query.value += filter;
	if (trailingSpace) query.value += " ";
}

async function openSearchFilters(ev) {
	await os.popupMenu(
			[
				{
					icon: "ph-user ph-bold ph-lg",
					text: i18n.ts._filters.fromUser,
					action: () => {
						os.selectUser().then((user) => {
							appendSearchFilter(`from:${Acct.toString(user)}`);
						});
					},
				},
				{
					icon: "ph-at ph-bold ph-lg",
					text: i18n.ts._filters.mentioning,
					action: () => {
						os.selectUser().then((user) => {
							appendSearchFilter(`mention:${Acct.toString(user)}`);
						});
					},
				},
				{
					icon: "ph-arrow-u-up-left ph-bold ph-lg",
					text: i18n.ts._filters.replyTo,
					action: () => {
						os.selectUser().then((user) => {
							appendSearchFilter(`reply:${Acct.toString(user)}`);
						});
					},
				},
				null,
				{
					icon: "ph-eye ph-bold ph-lg",
					text: i18n.ts._filters.followingOnly,
					action: () => {
						appendSearchFilter("filter:following");
					},
				},
				{
					icon: "ph-users-three ph-bold ph-lg",
					text: i18n.ts._filters.followersOnly,
					action: () => {
						appendSearchFilter("filter:followers");
					},
				},
				{
					icon: "ph-link ph-bold ph-lg",
					text: i18n.ts._filters.fromDomain,
					action: () => {
						appendSearchFilter("instance:", false);
					},
				},
				null,
				{
					type: "parent",
					text: i18n.ts._filters.withFile,
					icon: "ph-paperclip ph-bold ph-lg",
					children: [
						{
							text: i18n.ts.image,
							icon: "ph-image-square ph-bold ph-lg",
							action: () => {
								appendSearchFilter("has:image");
							},
						},
						{
							text: i18n.ts.video,
							icon: "ph-video-camera ph-bold ph-lg",
							action: () => {
								appendSearchFilter("has:video");
							},
						},
						{
							text: i18n.ts.audio,
							icon: "ph-music-note ph-bold ph-lg",
							action: () => {
								appendSearchFilter("has:audio");
							},
						},
						{
							text: i18n.ts.file,
							icon: "ph-file ph-bold ph-lg",
							action: () => {
								appendSearchFilter("has:file");
							},
						},
					],
				},
				null,
				{
					icon: "ph-calendar-blank ph-bold ph-lg",
					text: i18n.ts._filters.notesBefore,
					action: () => {
						os.inputDate({
							title: i18n.ts._filters.notesBefore,
						}).then((res) => {
							if (res.canceled) return;
							appendSearchFilter("before:" + formatDateToYYYYMMDD(res.result));
						});
					},
				},
				{
					icon: "ph-calendar-blank ph-bold ph-lg",
					text: i18n.ts._filters.notesAfter,
					action: () => {
						os.inputDate({
							title: i18n.ts._filters.notesAfter,
						}).then((res) => {
							if (res.canceled) return;
							appendSearchFilter("after:" + formatDateToYYYYMMDD(res.result));
						});
					},
				},
				null,
				{
					icon: "ph-arrow-u-up-left ph-bold ph-lg",
					text: i18n.ts._filters.excludeReplies,
					action: () => {
						appendSearchFilter("-filter:replies");
					},
				},
				{
					icon: "ph-repeat ph-bold ph-lg",
					text: i18n.ts._filters.excludeRenotes,
					action: () => {
						appendSearchFilter("-filter:renotes");
					},
				},
				null,
				{
					icon: "ph-text-aa ph-bold ph-lg",
					text: i18n.ts._filters.caseSensitive,
					action: () => {
						appendSearchFilter("case:sensitive");
					},
				},
				{
					icon: "ph-brackets-angle ph-bold ph-lg",
					text: i18n.ts._filters.matchWords,
					action: () => {
						appendSearchFilter("match:words");
					},
				},
				null,
				{
					icon: "ph-question ph-bold ph-lg",
					text: i18n.ts._filters._dialog.learnMore,
					action: () => {
						os.popup(XSearchFilterDialog, {}, {}, "closed");
					},
				},
			],
			ev.target,
			{ noReturnFocus: true },
	);
	input.value!.focus();
	input.value!.selectRange((query.value as string).length, (query.value as string).length); // cursor at end
}

function onInputKeydown(evt: KeyboardEvent) {
	if (evt.key === "Enter") {
		evt.preventDefault();
		evt.stopPropagation();
		emit('query', query.value);
	}
}
</script>

<template>
	<MkInput
			class="search"
			ref="input"
			v-model="query"
			style="flex: 1"
			type="text"
			autofocus
			:placeholder="i18n.ts.searchPlaceholder"
			:spellcheck="false"
			@keydown="onInputKeydown"
	>
		<template #prefix>
			<div>
				<i class="ph-magnifying-glass ph-bold"></i>
			</div>
		</template>
		<template #suffix>
			<button
					v-tooltip.noDelay="i18n.ts.filter"
					class="_buttonIcon"
					@click.stop="openSearchFilters"
			>
				<i class="ph-funnel ph-bold"></i>
			</button>
		</template>
	</MkInput>
</template>

<style scoped lang="scss">
.search {
	margin-bottom: 16px;
}
</style>
