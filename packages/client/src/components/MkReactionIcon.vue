<template>
	<MkEmoji
		:emoji="reaction"
		:custom-emojis="customEmojis || []"
		:is-reaction="true"
		:normal="true"
		:no-style="noStyle"
	/>
</template>

<script lang="ts" setup>
defineProps<{
	reaction: string;
	customEmojis?: any[]; // TODO
	noStyle?: boolean;
}>();
</script>
