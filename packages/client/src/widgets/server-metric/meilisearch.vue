<template>
	<div class="verusivbr">
		<XPie
			v-tooltip="i18n.ts.meiliIndexCount"
			class="pie"
			:value="progress"
			:reverse="true"
		/>
		<div>
			<p><i :class="icon('ph-file-search')"></i>MeiliSearch</p>
			<p>{{ i18n.ts._widgets.meiliStatus }}: {{ available }}</p>
			<p>{{ i18n.ts._widgets.meiliSize }}: {{ bytes(totalSize, 1) }}</p>
			<p>{{ i18n.ts._widgets.meiliIndexCount }}: {{ indexCount }}</p>
		</div>
	</div>
	<br />
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import XPie from "./pie.vue";
import bytes from "@/filters/bytes";
import { i18n } from "@/i18n";
import * as os from "@/os";
import icon from "@/scripts/icon";

const props = defineProps<{
	connection: any;
	meta: any;
}>();

const progress = ref<number>(0);
const serverStats = ref(null);
const totalSize = ref<number>(0);
const indexCount = ref<number>(0);
const available = ref<string>("unavailable");

function onStats(stats) {
	totalSize.value = stats.meilisearch.size;
	indexCount.value = stats.meilisearch.indexed_count;
	available.value = stats.meilisearch.health;
	progress.value = indexCount.value / serverStats.value.notesCount;
}

onMounted(() => {
	os.api("stats", {}).then((res) => {
		serverStats.value = res;
	});
	props.connection.on("stats", onStats);
});

onBeforeUnmount(() => {
	props.connection.off("stats", onStats);
});
</script>

<style lang="scss" scoped>
.verusivbr {
	display: flex;
	padding: 16px;

	> .pie {
		height: 82px;
		flex-shrink: 0;
		margin-right: 16px;
	}

	> div {
		flex: 1;

		> p {
			margin: 0;
			font-size: 0.8em;

			&:first-child {
				font-weight: bold;
				margin-bottom: 4px;

				> i {
					margin-right: 4px;
				}
			}
		}
	}
}
</style>
