<template>
	<Spacer :content-max="800">
		<Pagination v-slot="{ items }" ref="list" :pagination="pagination">
			<div
				v-for="item in items"
				:key="item.id"
				:to="`/clips/${item.id}`"
				class="item _panel _gap afdcfbfb"
			>
				<div class="header">
					<Avatar class="avatar" :user="user" />
					<ReactionIcon
						class="reaction"
						:reaction="item.type"
						:custom-emojis="item.note.emojis"
						:no-style="true"
					/>
					<Time :time="item.createdAt" class="createdAt" />
				</div>
				<Note :key="item.id" :note="item.note" />
			</div>
		</Pagination>
	</Spacer>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import * as misskey from "iceshrimp-js";
import Pagination from "@/components/Pagination.vue";
import Note from "@/components/Note.vue";
import ReactionIcon from "@/components/ReactionIcon.vue";

const props = defineProps<{
	user: misskey.entities.User;
}>();

const pagination = {
	endpoint: "users/reactions" as const,
	limit: 20,
	params: computed(() => ({
		userId: props.user.id,
	})),
};
</script>

<style lang="scss" scoped>
.afdcfbfb {
	> .header {
		display: flex;
		align-items: center;
		padding: 8px 16px;
		margin-bottom: 8px;
		border-bottom: solid 2px var(--divider);

		> .avatar {
			width: 24px;
			height: 24px;
			margin-right: 8px;
		}

		> .reaction {
			width: 32px;
			height: 32px;
		}

		> .createdAt {
			margin-left: auto;
		}
	}
}
</style>
