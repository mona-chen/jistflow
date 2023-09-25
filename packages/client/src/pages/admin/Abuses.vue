<template>
	<StickyContainer>
		<template #header>
			<PageHeader
				:actions="headerActions"
				:tabs="headerTabs"
				:display-back-button="true"
			/>
		</template>
		<Spacer :content-max="900">
			<div class="lcixvhis">
				<div class="_section reports">
					<div class="_content">
						<div class="inputs" style="display: flex">
							<Select v-model="state" style="margin: 0; flex: 1">
								<template #label>{{ i18n.ts.state }}</template>
								<option value="all">{{ i18n.ts.all }}</option>
								<option value="unresolved">
									{{ i18n.ts.unresolved }}
								</option>
								<option value="resolved">
									{{ i18n.ts.resolved }}
								</option>
							</Select>
							<Select
								v-model="targetUserOrigin"
								style="margin: 0; flex: 1"
							>
								<template #label>{{
									i18n.ts.reporteeOrigin
								}}</template>
								<option value="combined">
									{{ i18n.ts.all }}
								</option>
								<option value="local">
									{{ i18n.ts.local }}
								</option>
								<option value="remote">
									{{ i18n.ts.remote }}
								</option>
							</Select>
							<Select
								v-model="reporterOrigin"
								style="margin: 0; flex: 1"
							>
								<template #label>{{
									i18n.ts.reporterOrigin
								}}</template>
								<option value="combined">
									{{ i18n.ts.all }}
								</option>
								<option value="local">
									{{ i18n.ts.local }}
								</option>
								<option value="remote">
									{{ i18n.ts.remote }}
								</option>
							</Select>
						</div>
						<!-- TODO
			<div class="inputs" style="display: flex; padding-top: 1.2em;">
				<Input v-model="searchUsername" style="margin: 0; flex: 1;" type="text" :spellcheck="false">
					<span>{{ i18n.ts.username }}</span>
				</Input>
				<Input v-model="searchHost" style="margin: 0; flex: 1;" type="text" :spellcheck="false" :disabled="pagination.params().origin === 'local'">
					<span>{{ i18n.ts.host }}</span>
				</Input>
			</div>
			-->

						<Pagination
							v-slot="{ items }"
							ref="reports"
							:pagination="pagination"
							style="margin-top: var(--margin)"
						>
							<XAbuseReport
								v-for="report in items"
								:key="report.id"
								:report="report"
								@resolved="resolved"
							/>
						</Pagination>
					</div>
				</div>
			</div>
		</Spacer>
	</StickyContainer>
</template>

<script lang="ts" setup>
import { computed } from "vue";

import Input from "@/components/form/Input.vue";
import Select from "@/components/form/Select.vue";
import Pagination from "@/components/Pagination.vue";
import XAbuseReport from "@/components/AbuseReport.vue";
import * as os from "@/os";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";

let reports = $ref<InstanceType<typeof Pagination>>();

let state = $ref("unresolved");
let reporterOrigin = $ref("combined");
let targetUserOrigin = $ref("combined");
let searchUsername = $ref("");
let searchHost = $ref("");

const pagination = {
	endpoint: "admin/abuse-user-reports" as const,
	limit: 10,
	params: computed(() => ({
		state,
		reporterOrigin,
		targetUserOrigin,
	})),
};

function resolved(reportId) {
	reports.removeItem((item) => item.id === reportId);
}

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata({
	title: i18n.ts.abuseReports,
	icon: "ph-warning-circle ph-bold ph-lg",
});
</script>

<style lang="scss" scoped>
.lcixvhis {
	margin: var(--margin);
}
</style>
