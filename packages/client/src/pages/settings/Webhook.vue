<template>
	<div class="_formRoot">
		<FormSection>
			<FormLink :to="`/settings/webhook/new`"> Create webhook </FormLink>
		</FormSection>

		<FormSection>
			<Pagination :pagination="pagination">
				<template #default="{ items }">
					<FormLink
						v-for="webhook in items"
						:key="webhook.id"
						:to="`/settings/webhook/edit/${webhook.id}`"
						class="_formBlock"
					>
						<template #icon>
							<i
								v-if="webhook.active === false"
								class="ph-pause-circle ph-bold ph-lg"
							></i>
							<i
								v-else-if="webhook.latestStatus === null"
								class="ph-circle ph-fill"
							></i>
							<i
								v-else-if="
									[200, 201, 204].includes(
										webhook.latestStatus,
									)
								"
								class="ph-check ph-bold ph-lg"
								:style="{ color: 'var(--success)' }"
							></i>
							<i
								v-else
								class="ph-warning ph-bold ph-lg"
								:style="{ color: 'var(--error)' }"
							></i>
						</template>
						{{ webhook.name || webhook.url }}
						<template #suffix>
							<Time
								v-if="webhook.latestSentAt"
								:time="webhook.latestSentAt"
							></Time>
						</template>
					</FormLink>
				</template>
			</Pagination>
		</FormSection>
	</div>
</template>

<script lang="ts" setup>
import {} from "vue";
import Pagination from "@/components/Pagination.vue";
import FormSection from "@/components/form/Section.vue";
import FormLink from "@/components/form/Link.vue";
import { userPage } from "@/filters/user";
import * as os from "@/os";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";

const pagination = {
	endpoint: "i/webhooks/list" as const,
	limit: 10,
};

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata({
	title: "Webhook",
	icon: "ph-webhooks-logo ph-bold ph-lg",
});
</script>
