<template>
	<StickyContainer>
		<template #header>
			<PageHeader :actions="headerActions" :tabs="headerTabs" />
		</template>
		<Spacer :content-max="800">
			<Pagination
				v-slot="{ items }"
				:pagination="pagination"
				class="ruryvtyk _content"
			>
				<section
					v-for="(announcement, i) in items"
					:key="announcement.id"
					class="_card announcement"
				>
					<div class="_title">
						<span v-if="$i && !announcement.isRead">🆕 </span>
						<h3>{{ announcement.title }}</h3>
						<Time :time="announcement.createdAt" />
						<div v-if="announcement.updatedAt">
							{{ i18n.ts.updatedAt }}:
							<Time :time="announcement.createdAt" />
						</div>
					</div>
					<div class="_content">
						<Mfm :text="announcement.text" />
						<img
							v-if="announcement.imageUrl"
							:src="announcement.imageUrl"
						/>
					</div>
					<div v-if="$i && !announcement.isRead" class="_footer">
						<Button primary @click="read(items, announcement, i)"
							><i class="ph-check ph-bold ph-lg"></i>
							{{ i18n.ts.gotIt }}</Button
						>
					</div>
				</section>
			</Pagination>
		</Spacer>
	</StickyContainer>
</template>

<script lang="ts" setup>
import {} from "vue";
import Pagination from "@/components/Pagination.vue";
import Button from "@/components/Button.vue";
import * as os from "@/os";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";

const pagination = {
	endpoint: "announcements" as const,
	limit: 10,
};

// TODO: これは実質的に親コンポーネントから子コンポーネントのプロパティを変更してるのでなんとかしたい
function read(items, announcement, i) {
	items[i] = {
		...announcement,
		isRead: true,
	};
	os.api("i/read-announcement", { announcementId: announcement.id });
}

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata({
	title: i18n.ts.announcements,
	icon: "ph-megaphone-simple ph-bold ph-lg",
});
</script>

<style lang="scss" scoped>
.ruryvtyk {
	> .announcement {
		&:not(:last-child) {
			margin-bottom: var(--margin);
		}

		> ._title {
			padding: 14px 32px !important;
		}

		> ._content {
			> img {
				display: block;
				max-height: 300px;
				max-width: 100%;
				border-radius: 10px;
				margin-top: 1rem;
			}
		}
	}
}
</style>
