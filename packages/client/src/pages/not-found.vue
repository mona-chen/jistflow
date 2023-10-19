<template>
	<div class="ipledcug">
		<div class="_fullinfo">
			<img
				src="/static-assets/badges/not-found.webp"
				class="_ghost"
				alt="Not found"
			/>
			<div>{{ i18n.ts.notFoundDescription }}</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";
import icon from "@/scripts/icon";

definePageMetadata({
	title: i18n.ts.notFound,
	icon: `${icon("ph-warning")}`,
});
</script>
