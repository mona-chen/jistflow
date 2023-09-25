<template>
	<StickyContainer>
		<template #header>
			<PageHeader :actions="headerActions" :tabs="headerTabs" />
		</template>
		<Spacer :content-max="700">
			<div class="mk-list-page">
				<transition
					:name="$store.state.animation ? 'zoom' : ''"
					mode="out-in"
				>
					<div v-if="list" class="_section">
						<div class="_content">
							<Button inline @click="addUser()">{{
								i18n.ts.addUser
							}}</Button>
							<Button inline @click="renameList()">{{
								i18n.ts.rename
							}}</Button>
							<Button inline @click="deleteList()">{{
								i18n.ts.delete
							}}</Button>
							<FormSection>
								<FormSwitch v-model="hideFromHomeTl">{{
									i18n.ts.hideFromHome
								}}</FormSwitch>
							</FormSection>
						</div>
					</div>
				</transition>

				<transition
					:name="$store.state.animation ? 'zoom' : ''"
					mode="out-in"
				>
					<div v-if="list" class="_section members _gap">
						<div class="_title">{{ i18n.ts.members }}</div>
						<div class="_content">
							<div class="users">
								<div
									v-for="user in users"
									:key="user.id"
									class="user _panel"
								>
									<Avatar
										:user="user"
										class="avatar"
										:show-indicator="true"
									/>
									<div class="body">
										<UserName :user="user" class="name" />
										<Acct :user="user" class="acct" />
									</div>
									<div class="action">
										<button
											class="_button"
											@click="removeUser(user)"
											:aria-label="i18n.t('removeMember')"
										>
											<i class="ph-x ph-bold ph-lg"></i>
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</transition>
			</div>
		</Spacer>
	</StickyContainer>
</template>

<script lang="ts" setup>
import { computed, watch } from "vue";
import Button from "@/components/Button.vue";
import * as os from "@/os";
import { mainRouter } from "@/router";
import { definePageMetadata } from "@/scripts/page-metadata";
import { i18n } from "@/i18n";
import FormSwitch from "@/components/form/Switch.vue";
import FormSection from "@/components/form/Section.vue";

const props = defineProps<{
	listId: string;
}>();

let list = $ref(null);
let hideFromHomeTl = $ref(false); 
let users = $ref([]);

function fetchList() {
	os.api("users/lists/show", {
		listId: props.listId,
	}).then((_list) => {
		list = _list;
		hideFromHomeTl = _list.hideFromHomeTl;
		os.api("users/show", {
			userIds: list.userIds,
		}).then((_users) => {
			users = _users;
		});
	});
}

function addUser() {
	os.selectUser().then((user) => {
		os.apiWithDialog("users/lists/push", {
			listId: list.id,
			userId: user.id,
		}).then(() => {
			users.push(user);
		});
	});
}

function removeUser(user) {
	os.api("users/lists/pull", {
		listId: list.id,
		userId: user.id,
	}).then(() => {
		users = users.filter((x) => x.id !== user.id);
	});
}

async function renameList() {
	const { canceled, result: name } = await os.inputText({
		title: i18n.ts.enterListName,
		default: list.name,
	});
	if (canceled) return;

	await os.api("users/lists/update", {
		listId: list.id,
		name: name,
	});

	list.name = name;
}

async function deleteList() {
	const { canceled } = await os.confirm({
		type: "warning",
		text: i18n.t("removeAreYouSure", { x: list.name }),
	});
	if (canceled) return;

	await os.api("users/lists/delete", {
		listId: list.id,
	});
	os.success();
	mainRouter.push("/my/lists");
}

async function hideFromHome() {
	await os.api("users/lists/update", {
		listId: list.id,
		hideFromHomeTl: hideFromHomeTl,
	});
}

watch(() => props.listId, fetchList, { immediate: true });
watch(() => hideFromHomeTl, hideFromHome);

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata(
	computed(() =>
		list
			? {
					title: list.name,
					icon: "ph-list-bullets ph-bold ph-lg",
			  }
			: null,
	),
);
</script>

<style lang="scss" scoped>
.mk-list-page {
	> .members {
		> ._content {
			> .users {
				> .user {
					display: flex;
					align-items: center;
					padding: 16px;
					margin: 10px 0 auto;

					> .avatar {
						width: 50px;
						height: 50px;
					}

					> .body {
						flex: 1;
						padding: 8px;

						> .name {
							display: block;
							font-weight: bold;
						}

						> .acct {
							opacity: 0.5;
						}
					}
				}
			}
		}
	}
}
</style>
