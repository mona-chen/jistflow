<template>
	<div class="_formRoot">
		<FormSection>
			<FormLink :to="`/settings/webhook/new`"> Create webhook </FormLink>
		</FormSection>

		<FormSection>
			<MkPagination :pagination="pagination">
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
								:class="icon('ph-pause-circle')"
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
								:class="icon('ph-check')"
								:style="{ color: 'var(--success)' }"
							></i>
							<i
								v-else
								:class="icon('ph-warning')"
								:style="{ color: 'var(--error)' }"
							></i>
						</template>
						{{ webhook.name || webhook.url }}
						<template #suffix>
							<MkTime
								v-if="webhook.latestSentAt"
								:time="webhook.latestSentAt"
							></MkTime>
						</template>
					</FormLink>
				</template>
			</MkPagination>
		</FormSection>
	</div>
</template>

<script lang="ts" setup>
import MkPagination from "@/components/MkPagination.vue";
import FormSection from "@/components/form/section.vue";
import FormLink from "@/components/form/link.vue";
import { definePageMetadata } from "@/scripts/page-metadata";
import icon from "@/scripts/icon";

const pagination = {
	endpoint: "i/webhooks/list" as const,
	limit: 10,
};

definePageMetadata({
	title: "Webhook",
	icon: `${icon("ph-webhooks-logo")}`,
});
</script>
