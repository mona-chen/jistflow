<template>
	<MkStickyContainer>
		<template #header
			><MkPageHeader :actions="headerActions" :tabs="headerTabs"
		/></template>
		<div style="overflow: clip">
			<MkSpacer :content-max="600" :margin-min="20">
				<div class="_formRoot znqjceqz">
					<div id="debug"></div>
					<div
						ref="containerEl"
						v-panel
						class="_formBlock about"
						:class="{ playing: easterEggEngine != null }"
					>
						<img
							src="/client-assets/about-icon-dark.png"
							v-if="!darkMode"
							alt=""
							class="icon"
							draggable="false"
							@load="iconLoaded"
							@click="gravity"
						/>
						<img
								src="/client-assets/about-icon-light.png"
								v-if="darkMode"
								alt=""
								class="icon"
								draggable="false"
								@load="iconLoaded"
								@click="gravity"
						/>
						<div class="misskey">Iceshrimp</div>
						<div class="version">v{{ version }}</div>
						<span
							v-for="emoji in easterEggEmojis"
							:key="emoji.id"
							class="emoji"
							:data-physics-x="emoji.left"
							:data-physics-y="emoji.top"
							:class="{
								_physics_circle_: !emoji.emoji.startsWith(':'),
							}"
							><MkEmoji
								class="emoji"
								:emoji="emoji.emoji"
								:custom-emojis="$instance.emojis"
								:is-reaction="false"
								:normal="true"
								:no-style="true"
						/></span>
					</div>
					<div class="_formBlock" style="text-align: center">
						{{ i18n.ts._aboutIceshrimp.about }}
					</div>
					<FormSection>
						<div class="_formLinks">
							<FormLink
								to="https://iceshrimp.dev/iceshrimp/iceshrimp"
								external
							>
								<template #icon
									><i class="ph-code ph-bold ph-lg"></i
								></template>
								{{ i18n.ts._aboutIceshrimp.source }}
								<template #suffix
									>Git Forgejo</template
								>
							</FormLink>
							<FormLink
								to="https://translate.iceshrimp.dev/"
								external
							>
								<template #icon
									><i class="ph-translate ph-bold ph-lg"></i
								></template>
								{{ i18n.ts._aboutIceshrimp.translation }}
								<template #suffix
									>Weblate</template
								>
							</FormLink>
							<FormLink
								to="https://matrix.to/#/%23iceshrimp-dev:161.rocks"
								external
							>
								<template #icon
									><i class="ph-chats-circle ph-bold ph-lg"></i
								></template>
								{{ i18n.ts._aboutIceshrimp.chatroom }}
								<template #suffix
									>Matrix</template
								>
							</FormLink>
							<!-- <FormLink
								to="#"
								external
							>
								<template #icon
									><i class="ph-book-bookmark ph-bold ph-lg"></i
								></template>
								{{ i18n.ts._aboutIceshrimp.documentation }}
								<template #suffix
									>MkDocs</template
								>
							</FormLink> -->
							<!-- <FormLink
								to="#"
								external
							>
								<template #icon
									><i class="ph-road-horizon ph-bold ph-lg"></i
								></template>
								{{ i18n.ts._aboutIceshrimp.roadmap }}
								<template #suffix
									>Markdown</template
								>
							</FormLink> -->
							<FormLink
								to="https://iceshrimp.dev/iceshrimp/iceshrimp/src/branch/dev/CHANGELOG.md"
								external
							>
								<template #icon
									><i class="ph-newspaper ph-bold ph-lg"></i
								></template>
								{{ i18n.ts._aboutIceshrimp.changelog }}
								<template #suffix
									>Markdown</template
								>
							</FormLink>
						</div>
					</FormSection>
				</div>
			</MkSpacer>
		</div>
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount } from "vue";
import { version } from "@/config";
import FormLink from "@/components/form/link.vue";
import FormSection from "@/components/form/section.vue";
import MkButton from "@/components/MkButton.vue";
import MkLink from "@/components/MkLink.vue";
import MkSparkle from "@/components/MkSparkle.vue";
import { physics } from "@/scripts/physics";
import { i18n } from "@/i18n";
import { defaultStore } from "@/store";
import * as os from "@/os";
import { definePageMetadata } from "@/scripts/page-metadata";

let easterEggReady = false;
let easterEggEmojis = $ref([]);
let easterEggEngine = $ref(null);
const containerEl = $ref<HTMLElement>();

function iconLoaded() {
	const emojis = defaultStore.state.reactions;
	const containerWidth = containerEl?.offsetWidth;
	for (let i = 0; i < 32; i++) {
		easterEggEmojis.push({
			id: i.toString(),
			top: -(128 + Math.random() * 256),
			left: Math.random() * containerWidth,
			emoji: emojis[Math.floor(Math.random() * emojis.length)],
		});
	}

	nextTick(() => {
		easterEggReady = true;
	});
}

function gravity() {
	if (!easterEggReady) return;
	easterEggReady = false;
	easterEggEngine = physics(containerEl);
}

function iLoveMisskey() {
	os.post({
		initialText: "I $[jelly ❤] #Iceshrimp",
		instant: true,
	});
}

onBeforeUnmount(() => {
	if (easterEggEngine) {
		easterEggEngine.stop();
	}
});

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

const darkMode = computed(defaultStore.makeGetterSetter("darkMode"));

definePageMetadata({
	title: i18n.ts.aboutIceshrimp,
	icon: null,
});
</script>

<style lang="scss" scoped>
.znqjceqz {
	> .about {
		position: relative;
		text-align: center;
		padding: 16px;
		border-radius: var(--radius);

		&.playing {
			&,
			* {
				user-select: none;
			}

			* {
				will-change: transform;
			}

			> .emoji {
				visibility: visible;
			}
		}

		> .icon {
			display: block;
			width: 250px;
			margin: 0 auto;
			border-radius: 5px;
		}

		> .misskey {
			margin: 0.75em auto 0 auto;
			width: max-content;
		}

		> .version {
			margin: 0 auto;
			width: max-content;
			opacity: 0.5;
		}

		> .emoji {
			position: absolute;
			top: 0;
			left: 0;
			visibility: hidden;

			> .emoji {
				pointer-events: none;
				font-size: 24px;
				width: 24px;
			}
		}
	}
}
</style>
