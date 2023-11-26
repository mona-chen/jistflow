<template>
	<div v-if="!available" class="mod-player-disabled">
		<MkLoading v-if="fetching" />
		<MkError v-else-if="error" @retry="load()" />
	</div>
	<div v-else-if="hide" class="mod-player-disabled" @click="toggleVisible()">
		<div>
			<b><i class="ph-warning"></i> {{ i18n.ts.sensitive }}</b>
			<span>{{ i18n.ts.clickToShow }}</span>
		</div>
	</div>

	<div v-else class="mod-player-enabled">
		<div class="pattern-display">
			<div v-if="patternShow" ref="modPattern" class="mod-pattern">
				<span
					v-for="(row, i) in patData[currentPattern]"
					v-if="patData.length !== 0"
					ref="initRow"
					:class="{ modRowActive: isRowActive(i) }"
				>
					<span :class="{ modColQuarter: i % 4 === 0 }">{{
						indexText(i)
					}}</span>
					<span class="mod-row-inner">{{ getRowText(row) }}</span>
				</span>
				<MkLoading v-else />
			</div>
			<div v-else class="mod-pattern" @click="showPattern()">
				<span ref="initRow" class="modRowActive">
					<span class="modColQuarter">00</span>
					<span class="mod-row-inner">|F-12Ev10XEF</span>
				</span>
				<br />
				<p>{{ i18n.ts.clickToShowPatterns }}</p>
			</div>
		</div>
		<div class="controls">
			<button v-if="!loading" class="play" @click="playPause()">
				<i v-if="playing" class="ph-pause ph-fill"></i>
				<i v-else class="ph-play ph-fill"></i>
			</button>
			<MkLoading v-else :em="true" />
			<button class="stop" @click="stop()">
				<i class="ph-stop ph-fill"></i>
			</button>
			<button class="loop" @click="toggleLoop()">
				<i v-if="loop === -1" class="ph-repeat ph-fill"></i>
				<i v-else class="ph-repeat-once ph-fill"></i>
			</button>
			<FormRange
				ref="progress"
				v-model="position"
				class="progress"
				:min="0"
				:max="length"
				:step="0.1"
				:background="false"
				:tooltips="false"
				:instant="true"
				@update:modelValue="performSeek()"
			></FormRange>
			<button class="mute" @click="toggleMute()">
				<i v-if="muted" class="ph-speaker-simple-x ph-fill"></i>
				<i v-else class="ph-speaker-simple-high ph-fill"></i>
			</button>
			<FormRange
				v-model="player.context.gain.value"
				class="volume"
				:min="0"
				:max="1"
				:step="0.1"
				:background="false"
				:tooltips="false"
				:instant="true"
				@update:modelValue="updateMute()"
			></FormRange>
			<a
				class="download"
				:title="i18n.ts.download"
				:href="module.url"
				target="_blank"
			>
				<i class="ph-download-simple ph-fill"></i>
			</a>
		</div>
		<div class="buttons">
			<button
				v-if="module.comment"
				v-tooltip="i18n.ts.alt"
				class="_button"
				@click.stop="captionPopup"
			>
				<i :class="icon('ph-subtitles')"></i>
			</button>
			<button
				v-if="!hide"
				v-tooltip="i18n.ts.hide"
				class="_button"
				@click.stop="toggleVisible()"
			>
				<i :class="icon('ph-eye-slash')"></i>
			</button>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { nextTick, onDeactivated, onMounted, ref, shallowRef } from "vue";
import type * as firefish from "firefish-js";
import FormRange from "./form/range.vue";
import { i18n } from "@/i18n";
import * as os from "@/os";
import { defaultStore } from "@/store";
import { ChiptuneJsConfig, ChiptuneJsPlayer } from "@/scripts/chiptune2";
import icon from "@/scripts/icon";

const props = defineProps<{
	module: firefish.entities.DriveFile;
}>();

interface ModRow {
	notes: string[];
	insts: string[];
	vols: string[];
	fxs: string[];
	ops: string[];
}

const available = ref(false);
const initRow = shallowRef<HTMLSpanElement>();
const player = shallowRef(new ChiptuneJsPlayer(new ChiptuneJsConfig()));
const hide = ref(
	defaultStore.state.nsfw === "force"
		? true
		: props.module.isSensitive && defaultStore.state.nsfw !== "ignore",
);
const playing = ref(false);
const patternShow = ref(false);
const modPattern = ref<HTMLDivElement>();
const progress = ref<typeof FormRange>();
const position = ref(0);
const patData = shallowRef([] as ModRow[][]);
const currentPattern = ref(0);
const nbChannels = ref(0);
const length = ref(1);
const muted = ref(false);
const loop = ref(0);
const fetching = ref(true);
const error = ref(false);
const loading = ref(false);

function load() {
	player.value
		.load(props.module.url)
		.then((result: null) => {
			buffer = result;
			available.value = true;
			error.value = false;
			fetching.value = false;
		})
		.catch((e: any) => {
			console.error(e);
			error.value = true;
			fetching.value = false;
		});
}

onMounted(load);

let currentRow = 0,
	rowHeight = 0,
	buffer = null,
	isSeeking = false;

function captionPopup() {
	os.alert({
		type: "info",
		text: props.module.comment,
	});
}

function showPattern() {
	patternShow.value = !patternShow.value;
	nextTick(() => {
		if (playing.value) display();
		else stop();
	});
}

function getRowText(row: ModRow) {
	let text = "";
	for (let i = 0; i < row.notes.length; i++) {
		text = text.concat(
			"|",
			row.notes[i],
			row.insts[i],
			row.vols[i],
			row.fxs[i],
			row.ops[i],
		);
	}
	return text;
}

function playPause() {
	player.value.addHandler("onRowChange", (i: { index: number }) => {
		currentRow = i.index;
		currentPattern.value = player.value.getPattern();
		length.value = player.value.duration();
		if (!isSeeking) {
			position.value = player.value.position();
		}
		requestAnimationFrame(display);
	});

	player.value.addHandler("onEnded", () => {
		stop();
	});

	if (player.value.currentPlayingNode === null) {
		loading.value = true;
		player.value.play(buffer).then(() => {
			player.value.seek(position.value);
			player.value.repeat(loop.value);
			playing.value = true;
			loading.value = false;
		});
	} else {
		player.value.togglePause();
		playing.value = !player.value.currentPlayingNode.paused;
	}
}

async function stop(noDisplayUpdate = false) {
	player.value.stop();
	playing.value = false;
	if (!noDisplayUpdate) {
		try {
			await player.value.play(buffer);
			display(0, true);
		} catch (e) {
			console.warn(e);
		}
	}
	player.value.stop();
	position.value = 0;
	currentRow = 0;
	player.value.clearHandlers();
}

function toggleLoop() {
	loop.value = loop.value === -1 ? 0 : -1;
	player.value.repeat(loop.value);
}

let savedVolume = 0;

function toggleMute() {
	if (muted.value) {
		player.value.context.gain.value = savedVolume;
		savedVolume = 0;
	} else {
		savedVolume = player.value.context.gain.value;
		player.value.context.gain.value = 0;
	}
	muted.value = !muted.value;
}

function updateMute() {
	muted.value = false;
	savedVolume = 0;
}

function performSeek() {
	player.value.seek(position.value);
	display();
}

function toggleVisible() {
	hide.value = !hide.value;
	nextTick(() => {
		stop(hide.value);
	});
}

function isRowActive(i: number) {
	if (i === currentRow) {
		if (modPattern.value) {
			if (rowHeight === 0 && initRow.value)
				rowHeight = initRow.value[0].getBoundingClientRect().height;
			modPattern.value.scrollTop = currentRow * rowHeight;
		}
		return true;
	}
}

function indexText(i: number) {
	let rowText = i.toString(16);
	if (rowText.length === 1) {
		rowText = "0" + rowText;
	}
	return rowText;
}

function getRow(pattern: number, rowOffset: number) {
	const notes: string[] = [];
	const insts: string[] = [];
	const vols: string[] = [];
	const fxs: string[] = [];
	const ops: string[] = [];

	for (let channel = 0; channel < nbChannels.value; channel++) {
		const part = player.value.getPatternRowChannel(
			pattern,
			rowOffset,
			channel,
		);

		notes.push(part.substring(0, 3));
		insts.push(part.substring(4, 6));
		vols.push(part.substring(6, 9));
		fxs.push(part.substring(10, 11));
		ops.push(part.substring(11, 13));
	}

	return {
		notes,
		insts,
		vols,
		fxs,
		ops,
	};
}

function display(_time = 0, reset = false) {
	if (!patternShow.value) return;

	if (reset) {
		const pattern = player.value.getPattern();
		currentPattern.value = pattern;
	}

	if (patData.value.length === 0) {
		const nbPatterns = player.value.getNumPatterns();
		const pattern = player.value.getPattern();

		currentPattern.value = pattern;

		if (player.value.currentPlayingNode) {
			nbChannels.value = player.value.currentPlayingNode.nbChannels;
		}

		const patternsArray: ModRow[][] = [];

		for (let patOffset = 0; patOffset < nbPatterns; patOffset++) {
			const rowsArray: ModRow[] = [];
			const nbRows = player.value.getPatternNumRows(patOffset);
			for (let rowOffset = 0; rowOffset < nbRows; rowOffset++) {
				rowsArray.push(getRow(patOffset, rowOffset));
			}
			patternsArray.push(rowsArray);
		}

		patData.value = Object.freeze(patternsArray);
	}
}

onDeactivated(() => {
	stop();
});
</script>

<style lang="scss" scoped>
.mod-player-enabled {
	position: relative;
	display: flex;
	flex-direction: column;

	> i {
		display: block;
		position: absolute;
		border-radius: 6px;
		background-color: var(--fg);
		color: var(--accentLighten);
		font-size: 14px;
		opacity: 0.5;
		padding: 3px 6px;
		text-align: center;
		cursor: pointer;
		top: 12px;
		right: 12px;
	}

	> .buttons {
		display: flex;
		gap: 4px;
		position: absolute;
		border-radius: 6px;
		overflow: hidden;
		top: 12px;
		right: 12px;
		> * {
			background-color: var(--accentedBg);
			-webkit-backdrop-filter: var(--blur, blur(15px));
			backdrop-filter: var(--blur, blur(15px));
			color: var(--accent);
			font-size: 0.8em;
			padding: 6px 8px;
			text-align: center;
		}
	}

	> .pattern-display {
		width: 100%;
		height: 100%;
		overflow: hidden;
		color: var(--fg);
		background-color: var(--panelHighlight);
		text-align: center;
		font: 12px monospace;
		white-space: pre;
		user-select: none;

		> .mod-pattern {
			display: grid;
			overflow-y: hidden;
			height: 0;
			padding-top: calc((56.25% - 48px) / 2);
			padding-bottom: calc((56.25% - 48px) / 2);
			content-visibility: auto;

			> .modRowActive {
				opacity: 1;
			}

			> span {
				opacity: 0.5;

				> .modColQuarter {
					color: var(--badge);
				}

				> .mod-row-inner {
					background: repeating-linear-gradient(
						to right,
						var(--fg) 0 4ch,
						var(--codeBoolean) 4ch 6ch,
						var(--codeNumber) 6ch 9ch,
						var(--codeString) 9ch 10ch,
						var(--error) 10ch 12ch
					);
					background-clip: text;
					-webkit-background-clip: text;
					-webkit-text-fill-color: transparent;
				}
			}
		}
	}

	> .controls {
		display: flex;
		width: 100%;
		background-color: var(--panelHighlight);

		> * {
			padding: 4px 8px;
		}

		> button,
		a {
			border: none;
			background-color: transparent;
			color: var(--navFg);
			cursor: pointer;
			margin: auto;

			&:hover {
				background-color: var(--accentedBg);
				border-radius: 3px;
			}
		}

		> .progress {
			flex-grow: 1;
			min-width: 0;
		}

		> .volume {
			flex-shrink: 1;
			max-width: 128px;
		}
	}
}

.mod-player-disabled {
	display: flex;
	justify-content: center;
	align-items: center;
	background: var(--infoWarnBg);
	color: var(--infoWarnFg);

	> div {
		display: table-cell;
		text-align: center;
		font-size: 12px;

		> b {
			display: block;
		}
	}
}
</style>
