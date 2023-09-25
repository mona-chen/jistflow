<template>
	<div class="ngbfujlo">
		<Textarea :model-value="text" readonly style="margin: 0"></Textarea>
		<Button
			class="button"
			primary
			:disabled="posting || posted"
			@click="post()"
		>
			<i v-if="posted" class="ph-check ph-bold ph-lg"></i>
			<i v-else class="ph-paper-plane-tilt ph-bold ph-lg"></i>
		</Button>
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import Textarea from "../form/Textarea.vue";
import Button from "../Button.vue";
import { apiUrl } from "@/config";
import * as os from "@/os";
import { PostBlock } from "@/scripts/hpml/block";
import { Hpml } from "@/scripts/hpml/evaluator";

export default defineComponent({
	components: {
		Textarea,
		Button,
	},
	props: {
		block: {
			type: Object as PropType<PostBlock>,
			required: true,
		},
		hpml: {
			type: Object as PropType<Hpml>,
			required: true,
		},
	},
	data() {
		return {
			text: this.hpml.interpolate(this.block.text),
			posted: false,
			posting: false,
		};
	},
	watch: {
		"hpml.vars": {
			handler() {
				this.text = this.hpml.interpolate(this.block.text);
			},
			deep: true,
		},
	},
	methods: {
		upload() {
			const promise = new Promise((ok) => {
				const canvas = this.hpml.canvases[this.block.canvasId];
				canvas.toBlob((blob) => {
					const formData = new FormData();
					formData.append("file", blob);
					if (this.$store.state.uploadFolder) {
						formData.append(
							"folderId",
							this.$store.state.uploadFolder,
						);
					}

					fetch(apiUrl + "/drive/files/create", {
						method: "POST",
						body: formData,
						headers: {
							authorization: `Bearer ${this.$i.token}`,
						},
					})
						.then((response) => response.json())
						.then((f) => {
							ok(f);
						});
				});
			});
			os.promiseDialog(promise);
			return promise;
		},
		async post() {
			this.posting = true;
			const file = this.block.attachCanvasImage
				? await this.upload()
				: null;
			os.apiWithDialog("notes/create", {
				text: this.text === "" ? null : this.text,
				fileIds: file ? [file.id] : undefined,
			}).then(() => {
				this.posted = true;
			});
		},
	},
});
</script>

<style lang="scss" scoped>
.ngbfujlo {
	position: relative;
	padding: 32px;
	border-radius: 6px;
	box-shadow: 0 2px 8px var(--shadow);
	z-index: 1;

	> .button {
		margin-top: 32px;
	}

	@media (max-width: 600px) {
		padding: 16px;

		> .button {
			margin-top: 16px;
		}
	}
}
</style>
