<template>
	<DesignB />
	<XCommon />
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from "vue";
import DesignA from "./visitor/A.vue";
import DesignB from "./visitor/B.vue";
import XCommon from "./common/Common.vue";
import { i18n } from "@/i18n";

export default defineComponent({
	components: {
		XCommon,
		DesignA,
		DesignB,
	},
});
</script>
