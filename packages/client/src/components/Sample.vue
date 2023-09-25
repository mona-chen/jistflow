<template>
	<div class="_card">
		<div class="_content">
			<Input v-model="text">
				<template #label>Text</template>
			</Input>
			<Switch v-model="flag">
				<span>Switch is now {{ flag ? "on" : "off" }}</span>
			</Switch>
			<div style="margin: 32px 0">
				<Radio v-model="radio" value="misskey">Iceshrimp</Radio>
				<Radio v-model="radio" value="mastodon">Mastodon</Radio>
				<Radio v-model="radio" value="pleroma">Pleroma</Radio>
			</div>
			<Button inline>This is</Button>
			<Button inline primary>the button</Button>
		</div>
		<div class="_content" style="pointer-events: none">
			<Mfm :text="mfm" />
		</div>
		<div class="_content">
			<Button inline primary @click="openMenu">Open menu</Button>
			<Button inline primary @click="openDialog">Open dialog</Button>
			<Button inline primary @click="openForm">Open form</Button>
			<Button inline primary @click="openDrive">Open drive</Button>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Button from "@/components/Button.vue";
import Input from "@/components/form/Input.vue";
import Switch from "@/components/form/Switch.vue";
import Textarea from "@/components/form/Textarea.vue";
import Radio from "@/components/form/Radio.vue";
import * as os from "@/os";
import * as config from "@/config";

export default defineComponent({
	components: {
		Button,
		Input,
		Switch,
		Textarea,
		Radio,
	},

	data() {
		return {
			text: "",
			flag: true,
			radio: "iceshrimp",
			mfm: `Hello world! This is an @example mention. BTW, you are @${
				this.$i ? this.$i.username : "guest"
			}.\nAlso, here is ${config.url} and [example link](${
				config.url
			}). for more details, see https://iceshrimp.dev.\nAs you know #misskey is open-source software.`,
		};
	},

	methods: {
		async openDialog() {
			os.alert({
				type: "warning",
				title: "Oh my Calc",
				text: "Lorem ipsum dolor sit amet, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
			});
		},

		async openForm() {
			os.form("Example form", {
				foo: {
					type: "boolean",
					default: true,
					label: "This is a boolean property",
				},
				bar: {
					type: "number",
					default: 300,
					label: "This is a number property",
				},
				baz: {
					type: "string",
					default: "iceshrimp makes you happy.",
					label: "This is a string property",
				},
			});
		},

		async openDrive() {
			os.selectDriveFile();
		},

		async selectUser() {
			os.selectUser();
		},

		async openMenu(ev) {
			os.popupMenu(
				[
					{
						type: "label",
						text: "Fruits",
					},
					{
						text: "Create some apples",
						action: () => {},
					},
					{
						text: "Read some oranges",
						action: () => {},
					},
					{
						text: "Update some melons",
						action: () => {},
					},
					null,
					{
						text: "Delete some bananas",
						danger: true,
						action: () => {},
					},
				],
				ev.currentTarget ?? ev.target,
			);
		},
	},
});
</script>
