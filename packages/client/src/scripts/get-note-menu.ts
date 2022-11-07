import { defineAsyncComponent, Ref, inject } from 'vue';
import * as misskey from 'misskey-js';
import { pleaseLogin } from './please-login';
import { $i } from '@/account';
import { i18n } from '@/i18n';
import { instance } from '@/instance';
import * as os from '@/os';
import copyToClipboard from '@/scripts/copy-to-clipboard';
import { url } from '@/config';
import { noteActions } from '@/store';

export function getNoteMenu(props: {
	note: misskey.entities.Note;
	menuButton: Ref<HTMLElement>;
	translation: Ref<any>;
	translating: Ref<boolean>;
	isDeleted: Ref<boolean>;
	currentClipPage?: Ref<misskey.entities.Clip>;
}) {
	const isRenote = (
		props.note.renote != null &&
		props.note.text == null &&
		props.note.fileIds.length === 0 &&
		props.note.poll == null
	);

	const appearNote = isRenote ? props.note.renote as misskey.entities.Note : props.note;

	function del(): void {
		os.confirm({
			type: 'warning',
			text: i18n.ts.noteDeleteConfirm,
		}).then(({ canceled }) => {
			if (canceled) return;

			os.api('notes/delete', {
				noteId: appearNote.id,
			});
		});
	}

	function delEdit(): void {
		os.confirm({
			type: 'warning',
			text: i18n.ts.deleteAndEditConfirm,
		}).then(({ canceled }) => {
			if (canceled) return;

			os.api('notes/delete', {
				noteId: appearNote.id,
			});

			os.post({ initialNote: appearNote, renote: appearNote.renote, reply: appearNote.reply, channel: appearNote.channel });
		});
	}

	function toggleFavorite(favorite: boolean): void {
		os.apiWithDialog(favorite ? 'notes/favorites/create' : 'notes/favorites/delete', {
			noteId: appearNote.id,
		});
	}

	function toggleWatch(watch: boolean): void {
		os.apiWithDialog(watch ? 'notes/watching/create' : 'notes/watching/delete', {
			noteId: appearNote.id,
		});
	}

	function toggleThreadMute(mute: boolean): void {
		os.apiWithDialog(mute ? 'notes/thread-muting/create' : 'notes/thread-muting/delete', {
			noteId: appearNote.id,
		});
	}

	function copyContent(): void {
		copyToClipboard(appearNote.text);
		os.success();
	}

	function copyLink(): void {
		copyToClipboard(`${url}/notes/${appearNote.id}`);
		os.success();
	}

	function togglePin(pin: boolean): void {
		os.apiWithDialog(pin ? 'i/pin' : 'i/unpin', {
			noteId: appearNote.id,
		}, undefined, null, res => {
			if (res.id === '72dab508-c64d-498f-8740-a8eec1ba385a') {
				os.alert({
					type: 'error',
					text: i18n.ts.pinLimitExceeded,
				});
			}
		});
	}

	async function clip(): Promise<void> {
		const clips = await os.api('clips/list');
		os.popupMenu([{
			icon: 'ph-plus-bold',
			text: i18n.ts.createNew,
			action: async () => {
				const { canceled, result } = await os.form(i18n.ts.createNewClip, {
					name: {
						type: 'string',
						label: i18n.ts.name,
					},
					description: {
						type: 'string',
						required: false,
						multiline: true,
						label: i18n.ts.description,
					},
					isPublic: {
						type: 'boolean',
						label: i18n.ts.public,
						default: false,
					},
				});
				if (canceled) return;

				const clip = await os.apiWithDialog('clips/create', result);

				os.apiWithDialog('clips/add-note', { clipId: clip.id, noteId: appearNote.id });
			},
		}, null, ...clips.map(clip => ({
			text: clip.name,
			action: () => {
				os.promiseDialog(
					os.api('clips/add-note', { clipId: clip.id, noteId: appearNote.id }),
					null,
					async (err) => {
						if (err.id === '734806c4-542c-463a-9311-15c512803965') {
							const confirm = await os.confirm({
								type: 'warning',
								text: i18n.t('confirmToUnclipAlreadyClippedNote', { name: clip.name }),
							});
							if (!confirm.canceled) {
								os.apiWithDialog('clips/remove-note', { clipId: clip.id, noteId: appearNote.id });
								if (props.currentClipPage?.value.id === clip.id) props.isDeleted.value = true;
							}
						} else {
							os.alert({
								type: 'error',
								text: err.message + '\n' + err.id,
							});
						}
					},
				);
			},
		}))], props.menuButton.value, {
		}).then(focus);
	}

	async function unclip(): Promise<void> {
		os.apiWithDialog('clips/remove-note', { clipId: props.currentClipPage.value.id, noteId: appearNote.id });
		props.isDeleted.value = true;
	}

	async function promote(): Promise<void> {
		const { canceled, result: days } = await os.inputNumber({
			title: i18n.ts.numberOfDays,
		});

		if (canceled) return;

		os.apiWithDialog('admin/promo/create', {
			noteId: appearNote.id,
			expiresAt: Date.now() + (86400000 * days),
		});
	}

	function share(): void {
		navigator.share({
			title: i18n.t('noteOf', { user: appearNote.user.name }),
			text: appearNote.text,
			url: `${url}/notes/${appearNote.id}`,
		});
	}

	async function translate(): Promise<void> {
		if (props.translation.value != null) return;
		props.translating.value = true;
		const res = await os.api('notes/translate', {
			noteId: appearNote.id,
			targetLang: localStorage.getItem('lang') || navigator.language,
		});
		props.translating.value = false;
		props.translation.value = res;
	}

	let menu;
	if ($i) {
		const statePromise = os.api('notes/state', {
			noteId: appearNote.id,
		});

		menu = [
			...(
				props.currentClipPage?.value.userId === $i.id ? [{
					icon: 'ph-minus-circle-bold',
					text: i18n.ts.unclip,
					danger: true,
					action: unclip,
				}, null] : []
			),
			{
				icon: 'ph-clipboard-text-bold',
				text: i18n.ts.copyContent,
				action: copyContent,
			}, {
				icon: 'ph-link-simple-bold',
				text: i18n.ts.copyLink,
				action: copyLink,
			}, (appearNote.url || appearNote.uri) ? {
				icon: 'ph-arrow-square-out-bold',
				text: i18n.ts.showOnRemote,
				action: () => {
					window.open(appearNote.url || appearNote.uri, '_blank');
				},
			} : undefined,
			{
				icon: 'ph-share-network-bold',
				text: i18n.ts.share,
				action: share,
			},
			instance.translatorAvailable ? {
				icon: 'ph-translate-bold',
				text: i18n.ts.translate,
				action: translate,
			} : undefined,
			null,
			statePromise.then(state => state.isFavorited ? {
				icon: 'ph-star-bold',
				text: i18n.ts.unfavorite,
				action: () => toggleFavorite(false),
			} : {
				icon: 'ph-star-bold',
				text: i18n.ts.favorite,
				action: () => toggleFavorite(true),
			}),
			{
				icon: 'ph-paperclip-bold',
				text: i18n.ts.clip,
				action: () => clip(),
			},
			(appearNote.userId !== $i.id) ? statePromise.then(state => state.isWatching ? {
				icon: 'ph-eye-slash-bold',
				text: i18n.ts.unwatch,
				action: () => toggleWatch(false),
			} : {
				icon: 'ph-eye-bold',
				text: i18n.ts.watch,
				action: () => toggleWatch(true),
			}) : undefined,
			statePromise.then(state => state.isMutedThread ? {
				icon: 'ph-speaker-x-bold',
				text: i18n.ts.unmuteThread,
				action: () => toggleThreadMute(false),
			} : {
				icon: 'ph-speaker-x-bold',
				text: i18n.ts.muteThread,
				action: () => toggleThreadMute(true),
			}),
			appearNote.userId === $i.id ? ($i.pinnedNoteIds || []).includes(appearNote.id) ? {
				icon: 'ph-push-pin-bold',
				text: i18n.ts.unpin,
				action: () => togglePin(false),
			} : {
				icon: 'ph-push-pin-bold',
				text: i18n.ts.pin,
				action: () => togglePin(true),
			} : undefined,
			/*
		...($i.isModerator || $i.isAdmin ? [
			null,
			{
				icon: 'ph-megaphone-simple-bold',
				text: i18n.ts.promote,
				action: promote
			}]
			: []
		),*/
			...(appearNote.userId !== $i.id ? [
				null,
				{
					icon: 'ph-warning-circle-bold',
					text: i18n.ts.reportAbuse,
					action: () => {
						const u = appearNote.url || appearNote.uri || `${url}/notes/${appearNote.id}`;
						os.popup(defineAsyncComponent(() => import('@/components/MkAbuseReportWindow.vue')), {
							user: appearNote.user,
							initialComment: `Note: ${u}\n-----\n`,
						}, {}, 'closed');
					},
				}]
			: []
			),
			...(appearNote.userId === $i.id || $i.isModerator || $i.isAdmin ? [
				null,
				appearNote.userId === $i.id ? {
					icon: 'ph-eraser-bold',
					text: i18n.ts.deleteAndEdit,
					action: delEdit,
				} : undefined,
				{
					icon: 'ph-trash-bold',
					text: i18n.ts.delete,
					danger: true,
					action: del,
				}]
			: []
			)]
		.filter(x => x !== undefined);
	} else {
		menu = [{
			icon: 'ph-clipboard-text-bold',
			text: i18n.ts.copyContent,
			action: copyContent,
		}, {
			icon: 'ph-link-simple-bold',
			text: i18n.ts.copyLink,
			action: copyLink,
		}, (appearNote.url || appearNote.uri) ? {
			icon: 'ph-arrow-square-out-bold',
			text: i18n.ts.showOnRemote,
			action: () => {
				window.open(appearNote.url || appearNote.uri, '_blank');
			},
		} : undefined]
		.filter(x => x !== undefined);
	}

	if (noteActions.length > 0) {
		menu = menu.concat([null, ...noteActions.map(action => ({
			icon: 'ph-plug-bold',
			text: action.title,
			action: () => {
				action.handler(appearNote);
			},
		}))]);
	}

	return menu;
}
