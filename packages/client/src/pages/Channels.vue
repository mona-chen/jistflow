<template>
	<StickyContainer>
		<template #header>
			<PageHeader
				v-model:tab="tab"
				:actions="headerActions"
				:tabs="headerTabs"
			/>
		</template>
		<Spacer :content-max="700">
			<Info class="_gap" :warn="true">{{
				i18n.ts.channelFederationWarn
			}}</Info>
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
					<div class="_content grwlizim search">
						<Input
							v-model="searchQuery"
							:large="true"
							:autofocus="true"
							type="search"
						>
							<template #prefix
								><i
									class="ph-magnifying-glass ph-bold ph-lg"
								></i
							></template>
						</Input>
						<Radios
							v-model="searchType"
							@update:model-value="search()"
							class="_gap"
						>
							<option value="nameAndDescription">
								{{ i18n.ts._channel.nameAndDescription }}
							</option>
							<option value="nameOnly">
								{{ i18n.ts._channel.nameOnly }}
							</option>
						</Radios>
						<Button large primary @click="search" class="_gap">{{
							i18n.ts.search
						}}</Button>
						<FoldableSection v-if="channelPagination">
							<template #header>{{
								i18n.ts.searchResult
							}}</template>
							<ChannelList
								:key="key"
								:pagination="channelPagination"
							/>
						</FoldableSection>
					</div>
				</swiper-slide>
				<swiper-slide>
					<div class="_content grwlizim featured">
						<!-- <Pagination
							v-slot="{ items }"
							:pagination="featuredPagination"
							:disable-auto-load="true"
						>
							<ChannelPreview
								v-for="channel in items"
								:key="channel.id"
								class="_gap"
								:channel="channel"
							/>
						</Pagination> -->
						<ChannelList
							key="featured"
							:pagination="featuredPagination"
						/>
					</div>
				</swiper-slide>
				<swiper-slide>
					<div class="_content grwlizim following">
						<ChannelList
							key="following"
							:pagination="followingPagination"
						/>
					</div>
				</swiper-slide>
				<swiper-slide>
					<div class="_content grwlizim owned">
						<Button class="new" @click="create()"
							><i class="ph-plus ph-bold ph-lg"></i
						></Button>
						<ChannelList
							key="owned"
							:pagination="ownedPagination"
						/>
					</div>
				</swiper-slide>
			</swiper>
		</Spacer>
	</StickyContainer>
</template>

<script lang="ts" setup>
import { computed, onMounted, defineComponent, inject, watch } from "vue";
import { Virtual } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/vue";
import ChannelPreview from "@/components/ChannelPreview.vue";
import ChannelList from "@/components/ChannelList.vue";
import Pagination from "@/components/Pagination.vue";
import Input from "@/components/form/Input.vue";
import Radios from "@/components/form/Radios.vue";
import Button from "@/components/Button.vue";
import Folder from "@/components/Folder.vue";
import Info from "@/components/Info.vue";
import { useRouter } from "@/router";
import { definePageMetadata } from "@/scripts/page-metadata";
import { deviceKind } from "@/scripts/device-kind";
import { i18n } from "@/i18n";
import { defaultStore } from "@/store";
import "swiper/scss";
import "swiper/scss/virtual";

const router = useRouter();

const tabs = ["search", "featured", "following", "owned"];
let tab = $ref(tabs[1]);
watch($$(tab), () => syncSlide(tabs.indexOf(tab)));

const props = defineProps<{
	query: string;
	type?: string;
}>();
let key = $ref("");
let searchQuery = $ref("");
let searchType = $ref("nameAndDescription");
let channelPagination = $ref();
onMounted(() => {
	searchQuery = props.query ?? "";
	searchType = props.type ?? "nameAndDescription";
});

const featuredPagination = {
	endpoint: "channels/featured" as const,
	limit: 10,
	noPaging: false,
};
const followingPagination = {
	endpoint: "channels/followed" as const,
	limit: 10,
};
const ownedPagination = {
	endpoint: "channels/owned" as const,
	limit: 10,
};

async function search() {
	const query = searchQuery.toString().trim();
	if (query == null || query === "") return;
	const type = searchType.toString().trim();
	channelPagination = {
		endpoint: "channels/search",
		limit: 10,
		params: {
			query: searchQuery,
			type: type,
		},
	};
	key = query + type;
}

function create() {
	router.push("/channels/new");
}

const headerActions = $computed(() => [
	{
		icon: "ph-plus ph-bold ph-lg",
		text: i18n.ts.create,
		handler: create,
	},
]);

const headerTabs = $computed(() => [
	{
		key: "search",
		title: i18n.ts.search,
		icon: "ph-magnifying-glass ph-bold ph-lg",
	},
	{
		key: "featured",
		title: i18n.ts._channel.featured,
		icon: "ph-fire-simple ph-bold ph-lg",
	},
	{
		key: "following",
		title: i18n.ts._channel.following,
		icon: "ph-heart ph-bold ph-lg",
	},
	{
		key: "owned",
		title: i18n.ts._channel.owned,
		icon: "ph-crown-simple ph-bold ph-lg",
	},
]);

definePageMetadata(
	computed(() => ({
		title: i18n.ts.channel,
		icon: "ph-television ph-bold ph-lg",
	})),
);

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
