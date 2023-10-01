<template>
	<div class="_formRoot">
		<FormLink to="/settings/account-info" class="_formBlock">{{
			i18n.ts.accountInfo
		}}</FormLink>

		<FormLink to="/registry" class="_formBlock"
			><template #icon><i class="ph-gear-six ph-bold ph-lg"></i></template
			>{{ i18n.ts.registry }}</FormLink
		>

		<FormLink to="/settings/delete-account" class="_formBlock"
			><template #icon><i class="ph-warning ph-bold ph-lg"></i></template
			>{{ i18n.ts.closeAccount }}</FormLink
		>
	</div>
</template>

<script lang="ts" setup>
import FormLink from "@/components/form/link.vue";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";

definePageMetadata({
	title: i18n.ts.other,
	icon: "ph-dots-three-outline ph-bold ph-lg",
});
</script>
