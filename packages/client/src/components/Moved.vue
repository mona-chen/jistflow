<template>
	<div class="msjugskd _block">
		<i
			class="ph-airplane-takeoff ph-bold ph-lg"
			style="margin-right: 8px"
		/>
		{{ i18n.ts.accountMoved }}
		<Mention class="link" :username="acct" :host="host" />
	</div>
</template>

<script lang="ts" setup>
import Mention from "./Mention.vue";
import { i18n } from "@/i18n";

defineProps<{
	acct: string;
	host: string;
}>();
</script>

<style lang="scss" scoped>
.msjugskd {
	padding: 16px;
	font-size: 90%;
	background: var(--infoWarnBg);
	color: var(--error);
	border-radius: var(--radius);

	> .link {
		margin-left: 4px;
		color: var(--accent);
	}
}
</style>
