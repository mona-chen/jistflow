<template>
	<div>
		<StickyContainer>
			<template #header>
				<PageHeader
					:actions="headerActions"
					:tabs="headerTabs"
					:display-back-button="true"
				/>
			</template>
			<Spacer :content-max="900">
				<div class="lknzcolw">
					<div class="users">
						<div class="inputs">
							<Select v-model="sort" style="flex: 1">
								<template #label>{{ i18n.ts.sort }}</template>
								<option value="-createdAt">
									{{ i18n.ts.registeredDate }} ({{
										i18n.ts.ascendingOrder
									}})
								</option>
								<option value="+createdAt">
									{{ i18n.ts.registeredDate }} ({{
										i18n.ts.descendingOrder
									}})
								</option>
								<option value="-updatedAt">
									{{ i18n.ts.lastUsed }} ({{
										i18n.ts.ascendingOrder
									}})
								</option>
								<option value="+updatedAt">
									{{ i18n.ts.lastUsed }} ({{
										i18n.ts.descendingOrder
									}})
								</option>
							</Select>
							<Select v-model="state" style="flex: 1">
								<template #label>{{ i18n.ts.state }}</template>
								<option value="all">{{ i18n.ts.all }}</option>
								<option value="available">
									{{ i18n.ts.normal }}
								</option>
								<option value="admin">
									{{ i18n.ts.administrator }}
								</option>
								<option value="moderator">
									{{ i18n.ts.moderator }}
								</option>
								<option value="silenced">
									{{ i18n.ts.silence }}
								</option>
								<option value="suspended">
									{{ i18n.ts.suspend }}
								</option>
							</Select>
							<Select v-model="origin" style="flex: 1">
								<template #label>{{
									i18n.ts.instance
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
						<div class="inputs">
							<Input
								v-model="searchUsername"
								style="flex: 1"
								type="text"
								:spellcheck="false"
								@update:modelValue="$refs.users.reload()"
							>
								<template #prefix>@</template>
								<template #label>{{
									i18n.ts.username
								}}</template>
							</Input>
							<Input
								v-model="searchHost"
								style="flex: 1"
								type="text"
								:spellcheck="false"
								:disabled="pagination.params.origin === 'local'"
								@update:modelValue="$refs.users.reload()"
							>
								<template #prefix>@</template>
								<template #label>{{ i18n.ts.host }}</template>
							</Input>
						</div>

						<Pagination
							v-slot="{ items }"
							ref="paginationComponent"
							:pagination="pagination"
							class="users"
						>
							<A
								v-for="user in items"
								:key="user.id"
								v-tooltip.mfm="
									`Last posted: ${new Date(
										user.updatedAt,
									).toLocaleString()}`
								"
								class="user"
								:to="`/user-info/${user.id}`"
							>
								<UserCardMini :user="user" />
							</A>
						</Pagination>
					</div>
				</div>
			</Spacer>
		</StickyContainer>
	</div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import Input from "@/components/form/Input.vue";
import Select from "@/components/form/Select.vue";
import Pagination from "@/components/Pagination.vue";
import * as os from "@/os";
import { lookupUser } from "@/scripts/lookup-user";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";
import UserCardMini from "@/components/UserCardMini.vue";

let paginationComponent = $ref<InstanceType<typeof Pagination>>();

let sort = $ref("+createdAt");
let state = $ref("all");
let origin = $ref("local");
let searchUsername = $ref("");
let searchHost = $ref("");
const pagination = {
	endpoint: "admin/show-users" as const,
	limit: 10,
	params: computed(() => ({
		sort: sort,
		state: state,
		origin: origin,
		username: searchUsername,
		hostname: searchHost,
	})),
	offsetMode: true,
};

function searchUser() {
	os.selectUser().then((user) => {
		show(user);
	});
}

async function addUser() {
	const { canceled: canceled1, result: username } = await os.inputText({
		title: i18n.ts.username,
	});
	if (canceled1) return;

	const { canceled: canceled2, result: password } = await os.inputText({
		title: i18n.ts.password,
		type: "password",
	});
	if (canceled2) return;

	os.apiWithDialog("admin/accounts/create", {
		username: username,
		password: password,
	}).then((res) => {
		paginationComponent.reload();
	});
}

function show(user) {
	os.pageWindow(`/user-info/${user.id}`);
}

const headerActions = $computed(() => [
	{
		icon: "ph-magnifying-glass ph-bold ph-lg",
		text: i18n.ts.search,
		handler: searchUser,
	},
	{
		asFullButton: true,
		icon: "ph-plus ph-bold ph-lg",
		text: i18n.ts.addUser,
		handler: addUser,
	},
	{
		asFullButton: true,
		icon: "ph-magnifying-glass ph-bold ph-lg",
		text: i18n.ts.lookup,
		handler: lookupUser,
	},
]);

const headerTabs = $computed(() => []);

definePageMetadata(
	computed(() => ({
		title: i18n.ts.users,
		icon: "ph-users ph-bold ph-lg",
	})),
);
</script>

<style lang="scss" scoped>
.lknzcolw {
	> .users {
		> .inputs {
			display: flex;
			margin-bottom: 16px;

			> * {
				margin-right: 16px;

				&:last-child {
					margin-right: 0;
				}
			}
		}

		> .users {
			margin-top: var(--margin);
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
			grid-gap: 12px;

			> .user:hover {
				text-decoration: none;
			}
		}
	}
}
</style>
