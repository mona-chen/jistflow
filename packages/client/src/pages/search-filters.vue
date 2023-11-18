<template>
	<MkStickyContainer>
		<template #header><MkPageHeader v-if="!popup" /></template>
		<MkSpacer :content-max="800">
			<div class="search-filters">
				<div class="section _block">
					<div class="title">{{ i18n.ts._filters._dialog.info }}</div>
					<div class="content">
						<p>{{ i18n.ts._filters._dialog.info1 }}</p>
						<p>{{ i18n.ts._filters._dialog.info2 }}</p>
					</div>
				</div>
				<div class="section _block">
					<div class="title">{{ i18n.ts._filters._dialog.wordFilters }}</div>
					<div class="content">
						<p><code>[-]{{ i18n.ts._filters._dialog.word }}</code></p>
						<p><code>"{{ i18n.ts._filters._dialog.phrase }}"</code></p>
						<p><code>(one OR of OR multiple OR words)</code></p>
					</div>
				</div>
				<div class="section _block">
					<div class="title">{{ i18n.ts._filters._dialog.matchOptions }}</div>
					<div class="content">
						<p><code>case:sensitive</code></p>
						<p><code>match:word[s]</code></p>
					</div>
				</div>
				<div class="section _block">
					<div class="title">{{ i18n.ts._filters._dialog.userDomain }}</div>
					<div class="content">
						<p><code>[-]from:[@]user[@domain.tld]</code></p>
						<p><code>[-]mention:[@]user[@domain.tld]</code></p>
						<p><code>[-]reply:[@]user[@domain.tld]</code></p>
						<p><code>[-]instance:local|domain.tld</code></p>
					</div>
				</div>
				<div class="section _block">
					<div class="title">{{ i18n.ts._filters._dialog.miscFilters }}</div>
					<div class="content">
						<p><code>[-]filter:followers|following</code></p>
						<p><code>[-]filter:replies|renote[s]|boost[s]</code></p>
					</div>
				</div>
				<div class="section _block">
					<div class="title">{{ i18n.ts._filters._dialog.attachmentType }}</div>
					<div class="content">
						<p><code>has:image|video|audio|file</code></p>
					</div>
				</div>
				<div class="section _block">
					<div class="title">{{ i18n.ts._filters._dialog.postDate }}</div>
					<div class="content">
						<p>{{ i18n.ts._filters._dialog.exclusivity }}</p>
						<p><code>before:yyyy-mm-dd</code></p>
						<p><code>after:yyyy-mm-dd</code></p>
					</div>
				</div>
				<div class="section _block">
					<div class="title">{{ i18n.ts._filters._dialog.infoEnd }}</div>
					<div class="content">
						<p>{{ i18n.ts._filters._dialog.infoEnd1 }}</p>
						<p><code>filter:reply = filter:replies</code></p>
						<p><code>search:word[s] = match:word[s]</code></p>
						<p><code>domain: = host: = instance:</code></p>
						<p><code>until: = before:</code></p>
						<p><code>since: = after:</code></p>
						<p><code>host: = domain:</code></p>
						<p><code>to: = reply:</code></p>
					</div>
				</div>
			</div>
		</MkSpacer>
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import { defineComponent } from "vue";
import MkTextarea from "@/components/form/textarea.vue";
import { definePageMetadata } from "@/scripts/page-metadata";
import { i18n } from "@/i18n";
import { instance } from "@/instance";

defineProps<{
	popup?: boolean;
}>();

definePageMetadata({
	title: i18n.ts._filters._dialog.title,
	icon: "ph-funnel ph-bold ph-lg",
});
</script>

<style lang="scss" scoped>
.search-filters {
	> .section {
		> .title {
			position: sticky;
			z-index: 1;
			top: var(--stickyTop, 0px);
			padding: 16px;
			font-weight: bold;
			-webkit-backdrop-filter: var(--blur, blur(10px));
			backdrop-filter: var(--blur, blur(10px));
			background-color: var(--panelTransparent);
		}

		> .content {
			> p {
				margin: 0;
				padding: 16px;
				padding-top: 0;
			}

			> .preview {
				border-top: solid 0.5px var(--divider);
				padding: 16px;
			}
		}
	}
}
</style>
