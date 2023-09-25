<template>
	<StickyContainer>
		<template #header>
			<PageHeader
				v-model:tab="tab"
				:actions="headerActions"
				:tabs="headerTabs"
			/>
		</template>
		<Spacer
			v-if="instance"
			:content-max="600"
			:margin-min="16"
			:margin-max="32"
		>
			<swiper
				:round-lengths="true"
				:touch-angle="25"
				:threshold="10"
				:centeredSlides="true"
				:modules="[Virtual]"
				:space-between="20"
				:virtual="true"
				:allow-touch-move="
					defaultStore.state.swipeOnMobile &&
					(deviceKind !== 'desktop' ||
						defaultStore.state.swipeOnDesktop)
				"
				@swiper="setSwiperRef"
				@slide-change="onSlideChange"
			>
				<swiper-slide>
					<div class="_formRoot">
						<div class="fnfelxur">
							<img :src="faviconUrl" alt="" class="icon" />
							<span class="name">{{
								instance.name || `(${i18n.ts.unknown})`
							}}</span>
						</div>
						<KeyValue :copy="host" oneline style="margin: 1em 0">
							<template #key>Host</template>
							<template #value
								><span class="_monospace">
									<Link :url="`https://${host}`">{{
										host
									}}</Link>
								</span></template
							>
						</KeyValue>
						<KeyValue oneline style="margin: 1em 0">
							<template #key>{{ i18n.ts.software }}</template>
							<template #value
								><span class="_monospace"
									>{{
										instance.softwareName ||
										`(${i18n.ts.unknown})`
									}}
									/
									{{
										instance.softwareVersion ||
										`(${i18n.ts.unknown})`
									}}</span
								></template
							>
						</KeyValue>
						<KeyValue oneline style="margin: 1em 0">
							<template #key>{{
								i18n.ts.administrator
							}}</template>
							<template #value
								>{{
									instance.maintainerName ||
									`(${i18n.ts.unknown})`
								}}
								({{
									instance.maintainerEmail ||
									`(${i18n.ts.unknown})`
								}})</template
							>
						</KeyValue>
						<KeyValue>
							<template #key>{{ i18n.ts.description }}</template>
							<template #value>{{
								instance.description
							}}</template>
						</KeyValue>

						<FormSection v-if="iAmAdmin">
							<template #label>Moderation</template>
							<FormSuspense :p="init">
								<FormSwitch
									v-model="suspended"
									class="_formBlock"
									@update:modelValue="toggleSuspend"
									>{{
										i18n.ts.stopActivityDelivery
									}}</FormSwitch
								>
								<FormSwitch
									v-model="isBlocked"
									class="_formBlock"
									@update:modelValue="toggleBlock"
									>{{ i18n.ts.blockThisInstance }}</FormSwitch
								>
								<FormSwitch
									v-model="isSilenced"
									class="_formBlock"
									@update:modelValue="toggleSilence"
									>{{
										i18n.ts.silenceThisInstance
									}}</FormSwitch
								>
							</FormSuspense>
							<Button @click="refreshMetadata"
								><i
									class="ph-arrows-clockwise ph-bold ph-lg"
								></i>
								Refresh metadata</Button
							>
						</FormSection>

						<FormSection>
							<KeyValue oneline style="margin: 1em 0">
								<template #key>{{
									i18n.ts.registeredAt
								}}</template>
								<template #value
									><Time
										mode="detail"
										:time="instance.caughtAt"
								/></template>
							</KeyValue>
							<KeyValue oneline style="margin: 1em 0">
								<template #key>{{
									i18n.ts.updatedAt
								}}</template>
								<template #value
									><Time
										mode="detail"
										:time="instance.infoUpdatedAt"
								/></template>
							</KeyValue>
							<KeyValue oneline style="margin: 1em 0">
								<template #key>{{
									i18n.ts.latestRequestSentAt
								}}</template>
								<template #value
									><Time
										v-if="instance.latestRequestSentAt"
										:time="instance.latestRequestSentAt"
									/><span v-else>N/A</span></template
								>
							</KeyValue>
							<KeyValue oneline style="margin: 1em 0">
								<template #key>{{
									i18n.ts.latestStatus
								}}</template>
								<template #value>{{
									instance.latestStatus
										? instance.latestStatus
										: "N/A"
								}}</template>
							</KeyValue>
							<KeyValue oneline style="margin: 1em 0">
								<template #key>{{
									i18n.ts.latestRequestReceivedAt
								}}</template>
								<template #value
									><Time
										v-if="instance.latestRequestReceivedAt"
										:time="instance.latestRequestReceivedAt"
									/><span v-else>N/A</span></template
								>
							</KeyValue>
						</FormSection>

						<FormSection>
							<KeyValue oneline style="margin: 1em 0">
								<template #key>Following (Pub)</template>
								<template #value>{{
									number(instance.followingCount)
								}}</template>
							</KeyValue>
							<KeyValue oneline style="margin: 1em 0">
								<template #key>Followers (Sub)</template>
								<template #value>{{
									number(instance.followersCount)
								}}</template>
							</KeyValue>
						</FormSection>

						<FormSection>
							<template #label>Well-known resources</template>
							<FormLink
								:to="`https://${host}/.well-known/host-meta`"
								external
								style="margin-bottom: 8px"
							>
								host-meta</FormLink
							>
							<FormLink
								:to="`https://${host}/.well-known/host-meta.json`"
								external
								style="margin-bottom: 8px"
								>host-meta.json</FormLink
							>
							<FormLink
								:to="`https://${host}/.well-known/nodeinfo`"
								external
								style="margin-bottom: 8px"
							>
								nodeinfo</FormLink
							>
							<FormLink
								:to="`https://${host}/robots.txt`"
								external
								style="margin-bottom: 8px"
								>robots.txt
							</FormLink>
							<FormLink
								:to="`https://${host}/manifest.json`"
								external
								style="margin-bottom: 8px"
							>
								manifest.json</FormLink
							>
						</FormSection>
					</div>
				</swiper-slide>
				<swiper-slide>
					<div class="_formRoot">
						<div class="cmhjzshl">
							<div class="selects">
								<Select
									v-model="chartSrc"
									style="margin: 0 10px 0 0; flex: 1"
								>
									<option value="instance-requests">
										{{ i18n.ts._instanceCharts.requests }}
									</option>
									<option value="instance-users">
										{{ i18n.ts._instanceCharts.users }}
									</option>
									<option value="instance-users-total">
										{{ i18n.ts._instanceCharts.usersTotal }}
									</option>
									<option value="instance-notes">
										{{ i18n.ts._instanceCharts.notes }}
									</option>
									<option value="instance-notes-total">
										{{ i18n.ts._instanceCharts.notesTotal }}
									</option>
									<option value="instance-ff">
										{{ i18n.ts._instanceCharts.ff }}
									</option>
									<option value="instance-ff-total">
										{{ i18n.ts._instanceCharts.ffTotal }}
									</option>
									<option value="instance-drive-usage">
										{{ i18n.ts._instanceCharts.cacheSize }}
									</option>
									<option value="instance-drive-usage-total">
										{{
											i18n.ts._instanceCharts
												.cacheSizeTotal
										}}
									</option>
									<option value="instance-drive-files">
										{{ i18n.ts._instanceCharts.files }}
									</option>
									<option value="instance-drive-files-total">
										{{ i18n.ts._instanceCharts.filesTotal }}
									</option>
								</Select>
							</div>
							<div class="charts">
								<div class="label">
									{{ i18n.t("recentNHours", { n: 90 }) }}
								</div>
								<Chart
									class="chart"
									:src="chartSrc"
									span="hour"
									:limit="90"
									:args="{ host: host }"
									:detailed="true"
								></Chart>
								<div class="label">
									{{ i18n.t("recentNDays", { n: 90 }) }}
								</div>
								<Chart
									class="chart"
									:src="chartSrc"
									span="day"
									:limit="90"
									:args="{ host: host }"
									:detailed="true"
								></Chart>
							</div>
						</div>
					</div>
				</swiper-slide>
				<swiper-slide>
					<div class="_formRoot">
						<Pagination
							v-slot="{ items }"
							:pagination="usersPagination"
							style="
								display: grid;
								grid-template-columns: repeat(
									auto-fill,
									minmax(270px, 1fr)
								);
								grid-gap: 12px;
							"
						>
							<A
								v-for="user in items"
								:key="user.id"
								v-tooltip.mfm="
									`Last posted: ${new Date(
										user.updatedAt,
									).toLocaleString()}`
								"
								class="user"
								:to="`/user-info/${user.id}`"
							>
								<UserCardMini :user="user" />
							</A>
						</Pagination>
					</div>
				</swiper-slide>
				<swiper-slide>
					<div class="_formRoot">
						<ObjectView tall :value="instance"> </ObjectView>
					</div>
				</swiper-slide>
			</swiper>
		</Spacer>
	</StickyContainer>
</template>

<script lang="ts" setup>
import { watch } from "vue";
import { Virtual } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/vue";
import type * as iceshrimp from "iceshrimp-js";
import Chart from "@/components/Chart.vue";
import ObjectView from "@/components/ObjectView.vue";
import FormLink from "@/components/form/Link.vue";
import Link from "@/components/Link.vue";
import Button from "@/components/Button.vue";
import FormSection from "@/components/form/Section.vue";
import KeyValue from "@/components/KeyValue.vue";
import Select from "@/components/form/Select.vue";
import FormSwitch from "@/components/form/Switch.vue";
import * as os from "@/os";
import number from "@/filters/number";
import { iAmAdmin } from "@/account";
import { definePageMetadata } from "@/scripts/page-metadata";
import { deviceKind } from "@/scripts/device-kind";
import { defaultStore } from "@/store";
import { i18n } from "@/i18n";
import UserCardMini from "@/components/UserCardMini.vue";
import Pagination from "@/components/Pagination.vue";
import "swiper/scss";
import "swiper/scss/virtual";
import { getProxiedImageUrlNullable } from "@/scripts/media-proxy";

type AugmentedInstanceMetadata = iceshrimp.entities.DetailedInstanceMetadata & {
	blockedHosts: string[];
	silencedHosts: string[];
};
type AugmentedInstance = iceshrimp.entities.Instance & {
	isBlocked: boolean;
	isSilenced: boolean;
};

const props = defineProps<{
	host: string;
}>();

let tabs = ["overview"];
if (iAmAdmin) tabs.push("chart", "users", "raw");
let tab = $ref(tabs[0]);
watch($$(tab), () => syncSlide(tabs.indexOf(tab)));

let chartSrc = $ref("instance-requests");
let meta = $ref<AugmentedInstanceMetadata | null>(null);
let instance = $ref<AugmentedInstance | null>(null);
let suspended = $ref(false);
let isBlocked = $ref(false);
let isSilenced = $ref(false);
let faviconUrl = $ref(null);

const usersPagination = {
	endpoint: iAmAdmin ? "admin/show-users" : ("users" as const),
	limit: 10,
	params: {
		sort: "+updatedAt",
		state: "all",
		hostname: props.host,
	},
	offsetMode: true,
};

async function fetch() {
	if (iAmAdmin)
		meta = (await os.api("admin/meta")) as AugmentedInstanceMetadata;
	instance = (await os.api("federation/show-instance", {
		host: props.host,
	})) as AugmentedInstance;
	suspended = instance.isSuspended;
	isBlocked = instance.isBlocked;
	isSilenced = instance.isSilenced;
	faviconUrl =
		getProxiedImageUrlNullable(instance.faviconUrl, "preview") ??
		getProxiedImageUrlNullable(instance.iconUrl, "preview");
}

async function toggleBlock() {
	if (meta == null) return;
	if (!instance) {
		throw new Error(`Instance info not loaded`);
	}
	let blockedHosts: string[];
	if (isBlocked) {
		blockedHosts = meta.blockedHosts.concat([instance.host]);
	} else {
		blockedHosts = meta.blockedHosts.filter((x) => x !== instance!.host);
	}
	await os.api("admin/update-meta", {
		blockedHosts,
	});
}

async function toggleSilence() {
	if (meta == null) return;
	if (!instance) {
		throw new Error(`Instance info not loaded`);
	}
	let silencedHosts: string[];
	if (isSilenced) {
		silencedHosts = meta.silencedHosts.concat([instance.host]);
	} else {
		silencedHosts = meta.silencedHosts.filter((x) => x !== instance!.host);
	}
	await os.api("admin/update-meta", {
		silencedHosts,
	});
}

async function toggleSuspend(v) {
	await os.api("admin/federation/update-instance", {
		host: instance.host,
		isSuspended: suspended,
	});
}

function refreshMetadata() {
	os.api("admin/federation/refresh-remote-instance-metadata", {
		host: instance.host,
	});
	os.alert({
		text: "Refresh requested",
	});
}

fetch();

const headerActions = $computed(() => [
	{
		text: `https://${props.host}`,
		icon: "ph-arrow-square-out ph-bold ph-lg",
		handler: () => {
			window.open(`https://${props.host}`, "_blank");
		},
	},
]);

let theTabs = [
	{
		key: "overview",
		title: i18n.ts.overview,
		icon: "ph-info ph-bold ph-lg",
	},
];

if (iAmAdmin) {
	theTabs.push(
		{
			key: "chart",
			title: i18n.ts.charts,
			icon: "ph-chart-bar ph-bold ph-lg",
		},
		{
			key: "users",
			title: i18n.ts.users,
			icon: "ph-users ph-bold ph-lg",
		},
		{
			key: "raw",
			title: "Raw",
			icon: "ph-code ph-bold ph-lg",
		},
	);
}

let headerTabs = $computed(() => theTabs);

definePageMetadata({
	title: props.host,
	icon: "ph-hard-drives ph-bold ph-lg",
});

let swiperRef = null;

function setSwiperRef(swiper) {
	swiperRef = swiper;
	syncSlide(tabs.indexOf(tab));
}

function onSlideChange() {
	tab = tabs[swiperRef.activeIndex];
}

function syncSlide(index) {
	swiperRef.slideTo(index);
}
</script>

<style lang="scss" scoped>
.fnfelxur {
	display: flex;
	align-items: center;

	> .icon {
		display: block;
		margin: 0 16px 0 0;
		height: 64px;
		border-radius: 8px;
	}

	> .name {
		word-break: break-all;
	}
}

.cmhjzshl {
	> .selects {
		display: flex;
		margin: 0 0 16px 0;
	}

	> .charts {
		> .label {
			margin-bottom: 12px;
			font-weight: bold;
		}
	}
}
</style>
