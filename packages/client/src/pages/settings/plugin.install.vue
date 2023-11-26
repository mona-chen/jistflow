<template>
	<div class="_formRoot">
		<FormInfo warn class="_formBlock">{{
			i18n.ts._plugin.installWarn
		}}</FormInfo>

		<FormTextarea v-model="code" tall class="_formBlock">
			<template #label>{{ i18n.ts.code }}</template>
		</FormTextarea>

		<div class="_formBlock">
			<FormButton :disabled="code == null" primary inline @click="install"
				><i :class="icon('ph-check')"></i>
				{{ i18n.ts.install }}</FormButton
			>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, nextTick, ref } from "vue";
import { Interpreter, Parser, utils } from "@syuilo/aiscript";
import { v4 as uuid } from "uuid";
import { compareVersions } from "compare-versions";
import FormTextarea from "@/components/form/textarea.vue";
import FormButton from "@/components/MkButton.vue";
import FormInfo from "@/components/MkInfo.vue";
import * as os from "@/os";
import { ColdDeviceStorage } from "@/store";
import { unisonReload } from "@/scripts/unison-reload";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";
import icon from "@/scripts/icon";

const code = ref<string>();

function isSupportedVersion(version: string): boolean {
	try {
		return compareVersions(version, "0.12.0") >= 0;
	} catch (err) {
		return false;
	}
}

function installPlugin({ id, meta, src, token }) {
	ColdDeviceStorage.set(
		"plugins",
		ColdDeviceStorage.get("plugins").concat({
			...meta,
			id,
			active: true,
			configData: {},
			src,
			token,
		}),
	);
}

const parser = new Parser();

async function install() {
	if (code.value == null) return;

	const scriptVersion = utils.getLangVersion(code.value);

	if (scriptVersion == null) {
		os.alert({
			type: "error",
			text: "No language version annotation found :(",
		});
		return;
	}
	if (!isSupportedVersion(scriptVersion)) {
		os.alert({
			type: "error",
			text: `aiscript version '${scriptVersion}' is not supported :(`,
		});
		return;
	}

	let ast;
	try {
		ast = parser.parse(code.value);
	} catch (err) {
		os.alert({
			type: "error",
			text: `Syntax error : ${err}`,
		});
		return;
	}

	const meta = Interpreter.collectMetadata(ast);
	if (meta == null) {
		os.alert({
			type: "error",
			text: "No metadata found :(",
		});
		return;
	}

	const metadata = meta.get(null);
	if (metadata == null) {
		os.alert({
			type: "error",
			text: "No metadata found :(",
		});
		return;
	}

	const { name, version, author, description, permissions, config } =
		metadata;
	if (name == null || version == null || author == null) {
		os.alert({
			type: "error",
			text: "Required property (name, version, author) not found :(",
		});
		return;
	}

	const token =
		permissions == null || permissions.length === 0
			? null
			: await new Promise((res, rej) => {
					os.popup(
						defineAsyncComponent(
							() =>
								import(
									"@/components/MkTokenGenerateWindow.vue"
								),
						),
						{
							title: i18n.ts.tokenRequested,
							information:
								i18n.ts.pluginTokenRequestedDescription,
							initialName: name,
							initialPermissions: permissions,
						},
						{
							done: async (result) => {
								const { name, permissions } = result;
								const { token } = await os.api(
									"miauth/gen-token",
									{
										session: null,
										name,
										permission: permissions,
									},
								);
								res(token);
							},
						},
						"closed",
					);
			  });

	installPlugin({
		id: uuid(),
		meta: {
			name,
			version,
			author,
			description,
			permissions,
			config,
		},
		src: code.value,
		token,
	});

	os.success();

	nextTick(() => {
		unisonReload();
	});
}

definePageMetadata({
	title: i18n.ts._plugin.install,
	icon: `${icon("ph-download-simple")}`,
});
</script>
