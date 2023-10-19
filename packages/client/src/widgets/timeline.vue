<template>
	<MkContainer
		:show-header="widgetProps.showHeader"
		:style="`height: ${widgetProps.height}px;`"
		:scrollable="true"
		class="mkw-timeline"
	>
		<template #header>
			<button class="_button" @click="choose">
				<i
					v-if="widgetProps.src === 'home'"
					:class="icon('ph-house')"
				></i>
				<i
					v-else-if="widgetProps.src === 'local'"
					:class="icon('ph-chats-circle')"
				></i>
				<i
					v-else-if="widgetProps.src === 'social'"
					:class="icon('ph-share-network')"
				></i>
				<i
					v-else-if="widgetProps.src === 'global'"
					:class="icon('ph-planet')"
				></i>
				<i
					v-else-if="widgetProps.src === 'list'"
					:class="icon('ph-list-bullets')"
				></i>
				<i
					v-else-if="widgetProps.src === 'antenna'"
					:class="icon('ph-television')"
				></i>
				<span style="margin-left: 8px">{{
					widgetProps.src === "list"
						? widgetProps.list.name
						: widgetProps.src === "antenna"
						? widgetProps.antenna.name
						: i18n.t("_timelines." + widgetProps.src)
				}}</span>
				<i
					:class="
						icon(
							menuOpened
								? 'ph-caret-up ph-lg'
								: 'ph-caret-down ph-lg',
						)
					"
					style="margin-left: 8px"
				></i>
			</button>
		</template>

		<div>
			<XTimeline
				:key="
					widgetProps.src === 'list'
						? `list:${widgetProps.list.id}`
						: widgetProps.src === 'antenna'
						? `antenna:${widgetProps.antenna.id}`
						: widgetProps.src
				"
				:src="widgetProps.src"
				:list="widgetProps.list ? widgetProps.list.id : null"
				:antenna="widgetProps.antenna ? widgetProps.antenna.id : null"
			/>
		</div>
	</MkContainer>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import type { Widget, WidgetComponentExpose } from "./widget";
import { useWidgetPropsManager } from "./widget";
import type { GetFormResultType } from "@/scripts/form";
import * as os from "@/os";
import MkContainer from "@/components/MkContainer.vue";
import XTimeline from "@/components/MkTimeline.vue";
import { i18n } from "@/i18n";
import icon from "@/scripts/icon";

const name = "timeline";

const widgetPropsDef = {
	showHeader: {
		type: "boolean" as const,
		default: true,
	},
	height: {
		type: "number" as const,
		default: 300,
	},
	src: {
		type: "string" as const,
		default: "home",
		hidden: true,
	},
	antenna: {
		type: "object" as const,
		default: null,
		hidden: true,
	},
	list: {
		type: "object" as const,
		default: null,
		hidden: true,
	},
};

type WidgetProps = GetFormResultType<typeof widgetPropsDef>;

// 現時点ではvueの制限によりimportしたtypeをジェネリックに渡せない
// const props = defineProps<WidgetComponentProps<WidgetProps>>();
// const emit = defineEmits<WidgetComponentEmits<WidgetProps>>();
const props = defineProps<{ widget?: Widget<WidgetProps> }>();
const emit = defineEmits<{ (ev: "updateProps", props: WidgetProps) }>();

const { widgetProps, configure, save } = useWidgetPropsManager(
	name,
	widgetPropsDef,
	props,
	emit,
);

const menuOpened = ref(false);

const setSrc = (src) => {
	widgetProps.src = src;
	save();
};

const choose = async (ev) => {
	menuOpened.value = true;
	const [antennas, lists] = await Promise.all([
		os.api("antennas/list"),
		os.api("users/lists/list"),
	]);
	const antennaItems = antennas.map((antenna) => ({
		text: antenna.name,
		icon: `${icon("ph-flying-saucer")}`,
		action: () => {
			widgetProps.antenna = antenna;
			setSrc("antenna");
		},
	}));
	const listItems = lists.map((list) => ({
		text: list.name,
		icon: `${icon("ph-list-bullets")}`,
		action: () => {
			widgetProps.list = list;
			setSrc("list");
		},
	}));
	os.popupMenu(
		[
			{
				text: i18n.ts._timelines.home,
				icon: `${icon("ph-house")}`,
				action: () => {
					setSrc("home");
				},
			},
			{
				text: i18n.ts._timelines.local,
				icon: `${icon("ph-chats-teardrop")}`,
				action: () => {
					setSrc("local");
				},
			},
			{
				text: i18n.ts._timelines.social,
				icon: `${icon("ph-share-network")}`,
				action: () => {
					setSrc("social");
				},
			},
			{
				text: i18n.ts._timelines.global,
				icon: `${icon("ph-planet")}`,
				action: () => {
					setSrc("global");
				},
			},
			antennaItems.length > 0 ? null : undefined,
			...antennaItems,
			listItems.length > 0 ? null : undefined,
			...listItems,
		],
		ev.currentTarget ?? ev.target,
	).then(() => {
		menuOpened.value = false;
	});
};

defineExpose<WidgetComponentExpose>({
	name,
	configure,
	id: props.widget ? props.widget.id : null,
});
</script>
