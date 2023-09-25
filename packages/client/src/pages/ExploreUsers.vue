4.8 KiB
<template>
	<Spacer :content-max="1200">
		<Tab v-model="origin" style="margin-bottom: var(--margin)">
			<option value="local">{{ i18n.ts.local }}</option>
			<option value="remote">{{ i18n.ts.remote }}</option>
		</Tab>
		<div v-if="origin === 'local'">
			<template v-if="tag == null">
				<Folder class="_gap" persist-key="explore-pinned-users">
					<template #header
						><i
							class="ph-bookmark ph-bold ph-lg ph-fw"
							style="margin-right: 0.5em"
						></i
						>{{ i18n.ts.pinnedUsers }}</template
					>
					<XUserList :pagination="pinnedUsers" />
				</Folder>
				<Folder
					v-if="$i != null"
					class="_gap"
					persist-key="explore-popular-users"
				>
					<template #header
						><i
							class="ph-chart-line-up ph-bold ph-lg ph-fw"
							style="margin-right: 0.5em"
						></i
						>{{ i18n.ts.popularUsers }}</template
					>
					<XUserList :pagination="popularUsers" />
				</Folder>
				<Folder
					v-if="$i != null"
					class="_gap"
					persist-key="explore-recently-updated-users"
				>
					<template #header
						><i
							class="ph-activity ph-bold ph-lg ph-fw"
							style="margin-right: 0.5em"
						></i
						>{{ i18n.ts.recentlyUpdatedUsers }}</template
					>
					<XUserList :pagination="recentlyUpdatedUsers" />
				</Folder>
				<Folder
					v-if="$i != null"
					class="_gap"
					persist-key="explore-recently-registered-users"
				>
					<template #header
						><i
							class="ph-butterfly ph-bold ph-lg ph-fw"
							style="margin-right: 0.5em"
						></i
						>{{ i18n.ts.recentlyRegisteredUsers }}</template
					>
					<XUserList :pagination="recentlyRegisteredUsers" />
				</Folder>
			</template>
		</div>
		<div v-else>
			<Folder
				ref="tagsEl"
				:foldable="true"
				:expanded="false"
				class="_gap"
			>
				<template #header
					><i
						class="ph-compass ph-bold ph-lg ph-fw"
						style="margin-right: 0.5em"
					></i
					>{{ i18n.ts.popularTags }}</template
				>

				<div class="vxjfqztj">
					<A
						v-for="tag in tagsLocal"
						:key="'local:' + tag.tag"
						:to="`/tags/${tag.tag}`"
						class="local"
						>{{ tag.tag }}</A
					>
					<A
						v-for="tag in tagsRemote"
						:key="'remote:' + tag.tag"
						:to="`/tags/${tag.tag}`"
						>{{ tag.tag }}</A
					>
				</div>
			</Folder>

			<Folder v-if="tag != null" :key="`${tag}`" class="_gap">
				<template #header
					><i
						class="ph-hash ph-bold ph-lg ph-fw"
						style="margin-right: 0.5em"
					></i
					>{{ tag }}</template
				>
				<XUserList :pagination="tagUsers" />
			</Folder>

			<template v-if="tag == null && $i != null">
				<Folder class="_gap">
					<template #header
						><i
							class="ph-chart-line-up ph-bold ph-lg ph-fw"
							style="margin-right: 0.5em"
						></i
						>{{ i18n.ts.popularUsers }}</template
					>
					<XUserList :pagination="popularUsersF" />
				</Folder>
				<Folder class="_gap">
					<template #header
						><i
							class="ph-activity ph-bold ph-lg ph-fw"
							style="margin-right: 0.5em"
						></i
						>{{ i18n.ts.recentlyUpdatedUsers }}</template
					>
					<XUserList :pagination="recentlyUpdatedUsersF" />
				</Folder>
				<Folder class="_gap">
					<template #header
						><i
							class="ph-rocke-launch ph-bold ph-lg ph-fw"
							style="margin-right: 0.5em"
						></i
						>{{ i18n.ts.recentlyDiscoveredUsers }}</template
					>
					<XUserList :pagination="recentlyRegisteredUsersF" />
				</Folder>
			</template>
		</div>
	</Spacer>
</template>

<script lang="ts" setup>
import { computed, watch } from "vue";
import XUserList from "@/components/UserList.vue";
import Folder from "@/components/Folder.vue";
import Tab from "@/components/Tab.vue";
import number from "@/filters/number";
import * as os from "@/os";
import { i18n } from "@/i18n";
import { $i } from "@/account";
import { instance } from "@/instance";

const props = defineProps<{
	tag?: string;
}>();

let origin = $ref("local");
let tagsEl = $ref<InstanceType<typeof Folder>>();
let tagsLocal = $ref([]);
let tagsRemote = $ref([]);

watch(
	() => props.tag,
	() => {
		if (tagsEl) tagsEl.toggleContent(props.tag == null);
	},
);

const tagUsers = $computed(() => ({
	endpoint: "hashtags/users" as const,
	limit: 30,
	params: {
		tag: props.tag,
		origin: "combined",
		sort: "+follower",
	},
}));

const pinnedUsers = { endpoint: "pinned-users" };
const popularUsers = {
	endpoint: "users",
	limit: 10,
	noPaging: true,
	params: {
		state: "alive",
		origin: "local",
		sort: "+follower",
	},
};
const recentlyUpdatedUsers = {
	endpoint: "users",
	limit: 10,
	noPaging: true,
	params: {
		origin: "local",
		sort: "+updatedAt",
	},
};
const recentlyRegisteredUsers = {
	endpoint: "users",
	limit: 10,
	noPaging: true,
	params: {
		origin: "local",
		state: "alive",
		sort: "+createdAt",
	},
};
const popularUsersF = {
	endpoint: "users",
	limit: 10,
	noPaging: true,
	params: {
		state: "alive",
		origin: "remote",
		sort: "+follower",
	},
};
const recentlyUpdatedUsersF = {
	endpoint: "users",
	limit: 10,
	noPaging: true,
	params: {
		origin: "combined",
		sort: "+updatedAt",
	},
};
const recentlyRegisteredUsersF = {
	endpoint: "users",
	limit: 10,
	noPaging: true,
	params: {
		origin: "combined",
		sort: "+createdAt",
	},
};

os.api("hashtags/list", {
	sort: "+attachedLocalUsers",
	attachedToLocalUserOnly: true,
	limit: 30,
}).then((tags) => {
	tagsLocal = tags;
});
os.api("hashtags/list", {
	sort: "+attachedRemoteUsers",
	attachedToRemoteUserOnly: true,
	limit: 30,
}).then((tags) => {
	tagsRemote = tags;
});
</script>

<style lang="scss" scoped>
.vxjfqztj {
	> * {
		margin-right: 16px;

		&.local {
			font-weight: bold;
		}
	}
}
</style>
