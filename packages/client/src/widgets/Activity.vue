<template>
	<Container
		:show-header="widgetProps.showHeader"
		:naked="widgetProps.transparent"
		class="mkw-activity"
	>
		<template #header
			><i class="ph-chart-bar ph-bold ph-lg"></i
			>{{ i18n.ts._widgets.activity }}</template
		>
		<template #func
			><button
				v-if="!widgetProps.newStyle"
				class="_button"
				@click="toggleView()"
			>
				<i class="ph-sort-ascending ph-bold ph-lg"></i></button
		></template>

		<div v-if="widgetProps.newStyle">
			<Heatmap src="my-notes" />
		</div>
		<div v-else>
			<Loading v-if="fetching" />
			<template v-else>
				<XCalendar
					v-show="widgetProps.view === 0"
					:activity="[].concat(activity)"
				/>
				<XChart
					v-show="widgetProps.view === 1"
					:activity="[].concat(activity)"
				/>
			</template>
		</div>
	</Container>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, reactive, ref, watch } from "vue";
import type { Widget, WidgetComponentExpose } from "./widget";
import {
	WidgetComponentEmits,
	WidgetComponentProps,
	useWidgetPropsManager,
} from "./widget";
import XCalendar from "./ActivityCalendar.vue";
import XChart from "./ActivityChart.vue";
import Heatmap from "@/components/Heatmap.vue";
import type { GetFormResultType } from "@/scripts/form";
import * as os from "@/os";
import Container from "@/components/Container.vue";
import { $i } from "@/account";
import { i18n } from "@/i18n";

const name = "activity";

const widgetPropsDef = {
	newStyle: {
		type: "boolean" as const,
		default: true,
	},
	showHeader: {
		type: "boolean" as const,
		default: true,
	},
	transparent: {
		type: "boolean" as const,
		default: false,
	},
	view: {
		type: "number" as const,
		default: 0,
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

const activity = ref(null);
const fetching = ref(true);

const toggleView = () => {
	if (widgetProps.view === 1) {
		widgetProps.view = 0;
	} else {
		widgetProps.view++;
	}
	save();
};

os.apiGet("charts/user/notes", {
	userId: $i.id,
	span: "day",
	limit: 7 * 21,
}).then((res) => {
	activity.value = res.diffs.normal.map((_, i) => ({
		total: res.diffs.normal[i] + res.diffs.reply[i] + res.diffs.renote[i],
		notes: res.diffs.normal[i],
		replies: res.diffs.reply[i],
		renotes: res.diffs.renote[i],
	}));
	fetching.value = false;
});

defineExpose<WidgetComponentExpose>({
	name,
	configure,
	id: props.widget ? props.widget.id : null,
});
</script>
