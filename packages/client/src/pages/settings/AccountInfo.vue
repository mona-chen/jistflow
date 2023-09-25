<template>
	<div class="_formRoot">
		<KeyValue>
			<template #key>ID</template>
			<template #value
				><span class="_monospace">{{ $i.id }}</span></template
			>
		</KeyValue>

		<FormSection>
			<KeyValue>
				<template #key>{{ i18n.ts.registeredDate }}</template>
				<template #value
					><Time :time="$i.createdAt" mode="detail"
				/></template>
			</KeyValue>
		</FormSection>

		<FormSection v-if="stats">
			<template #label>{{ i18n.ts.statistics }}</template>
			<KeyValue oneline style="margin: 1em 0">
				<template #key>{{ i18n.ts.notesCount }}</template>
				<template #value>{{ number(stats.notesCount) }}</template>
			</KeyValue>
			<KeyValue oneline style="margin: 1em 0">
				<template #key>{{ i18n.ts.repliesCount }}</template>
				<template #value>{{ number(stats.repliesCount) }}</template>
			</KeyValue>
			<KeyValue oneline style="margin: 1em 0">
				<template #key>{{ i18n.ts.renotesCount }}</template>
				<template #value>{{ number(stats.renotesCount) }}</template>
			</KeyValue>
			<KeyValue oneline style="margin: 1em 0">
				<template #key>{{ i18n.ts.repliedCount }}</template>
				<template #value>{{ number(stats.repliedCount) }}</template>
			</KeyValue>
			<KeyValue oneline style="margin: 1em 0">
				<template #key>{{ i18n.ts.renotedCount }}</template>
				<template #value>{{ number(stats.renotedCount) }}</template>
			</KeyValue>
			<KeyValue oneline style="margin: 1em 0">
				<template #key>{{ i18n.ts.pollVotesCount }}</template>
				<template #value>{{ number(stats.pollVotesCount) }}</template>
			</KeyValue>
			<KeyValue oneline style="margin: 1em 0">
				<template #key>{{ i18n.ts.pollVotedCount }}</template>
				<template #value>{{ number(stats.pollVotedCount) }}</template>
			</KeyValue>
			<KeyValue oneline style="margin: 1em 0">
				<template #key>{{ i18n.ts.sentReactionsCount }}</template>
				<template #value>{{
					number(stats.sentReactionsCount)
				}}</template>
			</KeyValue>
			<KeyValue oneline style="margin: 1em 0">
				<template #key>{{ i18n.ts.receivedReactionsCount }}</template>
				<template #value>{{
					number(stats.receivedReactionsCount)
				}}</template>
			</KeyValue>
			<KeyValue oneline style="margin: 1em 0">
				<template #key>{{ i18n.ts.noteFavoritesCount }}</template>
				<template #value>{{
					number(stats.noteFavoritesCount)
				}}</template>
			</KeyValue>
			<KeyValue oneline style="margin: 1em 0">
				<template #key>{{ i18n.ts.followingCount }}</template>
				<template #value>{{ number(stats.followingCount) }}</template>
			</KeyValue>
			<KeyValue oneline style="margin: 1em 0">
				<template #key
					>{{ i18n.ts.followingCount }} ({{
						i18n.ts.local
					}})</template
				>
				<template #value>{{
					number(stats.localFollowingCount)
				}}</template>
			</KeyValue>
			<KeyValue oneline style="margin: 1em 0">
				<template #key
					>{{ i18n.ts.followingCount }} ({{
						i18n.ts.remote
					}})</template
				>
				<template #value>{{
					number(stats.remoteFollowingCount)
				}}</template>
			</KeyValue>
			<KeyValue oneline style="margin: 1em 0">
				<template #key>{{ i18n.ts.followersCount }}</template>
				<template #value>{{ number(stats.followersCount) }}</template>
			</KeyValue>
			<KeyValue oneline style="margin: 1em 0">
				<template #key
					>{{ i18n.ts.followersCount }} ({{
						i18n.ts.local
					}})</template
				>
				<template #value>{{
					number(stats.localFollowersCount)
				}}</template>
			</KeyValue>
			<KeyValue oneline style="margin: 1em 0">
				<template #key
					>{{ i18n.ts.followersCount }} ({{
						i18n.ts.remote
					}})</template
				>
				<template #value>{{
					number(stats.remoteFollowersCount)
				}}</template>
			</KeyValue>
			<KeyValue oneline style="margin: 1em 0">
				<template #key>{{ i18n.ts.pageLikesCount }}</template>
				<template #value>{{ number(stats.pageLikesCount) }}</template>
			</KeyValue>
			<KeyValue oneline style="margin: 1em 0">
				<template #key>{{ i18n.ts.pageLikedCount }}</template>
				<template #value>{{ number(stats.pageLikedCount) }}</template>
			</KeyValue>
			<KeyValue oneline style="margin: 1em 0">
				<template #key>{{ i18n.ts.driveFilesCount }}</template>
				<template #value>{{ number(stats.driveFilesCount) }}</template>
			</KeyValue>
			<KeyValue oneline style="margin: 1em 0">
				<template #key>{{ i18n.ts.driveUsage }}</template>
				<template #value>{{ bytes(stats.driveUsage) }}</template>
			</KeyValue>
		</FormSection>

		<FormSection>
			<template #label>{{ i18n.ts.other }}</template>
			<KeyValue oneline style="margin: 1em 0">
				<template #key>emailVerified</template>
				<template #value>{{
					$i.emailVerified ? i18n.ts.yes : i18n.ts.no
				}}</template>
			</KeyValue>
			<KeyValue oneline style="margin: 1em 0">
				<template #key>twoFactorEnabled</template>
				<template #value>{{
					$i.twoFactorEnabled ? i18n.ts.yes : i18n.ts.no
				}}</template>
			</KeyValue>
			<KeyValue oneline style="margin: 1em 0">
				<template #key>securityKeys</template>
				<template #value>{{
					$i.securityKeys ? i18n.ts.yes : i18n.ts.no
				}}</template>
			</KeyValue>
			<KeyValue oneline style="margin: 1em 0">
				<template #key>usePasswordLessLogin</template>
				<template #value>{{
					$i.usePasswordLessLogin ? i18n.ts.yes : i18n.ts.no
				}}</template>
			</KeyValue>
			<KeyValue oneline style="margin: 1em 0">
				<template #key>isModerator</template>
				<template #value>{{
					$i.isModerator ? i18n.ts.yes : i18n.ts.no
				}}</template>
			</KeyValue>
			<KeyValue oneline style="margin: 1em 0">
				<template #key>isAdmin</template>
				<template #value>{{
					$i.isAdmin ? i18n.ts.yes : i18n.ts.no
				}}</template>
			</KeyValue>
		</FormSection>
	</div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import FormSection from "@/components/form/Section.vue";
import KeyValue from "@/components/KeyValue.vue";
import * as os from "@/os";
import number from "@/filters/number";
import bytes from "@/filters/bytes";
import { $i } from "@/account";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";

const stats = ref<any>({});

onMounted(() => {
	os.api("users/stats", {
		userId: $i!.id,
	}).then((response) => {
		stats.value = response;
	});
});

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata({
	title: i18n.ts.accountInfo,
	icon: "ph-info ph-bold ph-lg",
});
</script>
