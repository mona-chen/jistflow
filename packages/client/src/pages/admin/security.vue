<template>
	<MkStickyContainer>
		<template #header
			><MkPageHeader
				:actions="headerActions"
				:tabs="headerTabs"
				:display-back-button="true"
		/></template>
		<MkSpacer :content-max="700" :margin-min="16" :margin-max="32">
			<FormSuspense :p="init">
				<div class="_formRoot">
					<FormFolder class="_formBlock">
						<template #icon
							><i class="ph-robot ph-bold ph-lg"></i
						></template>
						<template #label>{{ i18n.ts.botProtection }}</template>
						<template v-if="enableHcaptcha" #suffix
							>hCaptcha</template
						>
						<template v-else-if="enableRecaptcha" #suffix
							>reCAPTCHA</template
						>
						<template v-else #suffix
							>{{ i18n.ts.none }} ({{
								i18n.ts.notRecommended
							}})</template
						>

						<XBotProtection />
					</FormFolder>

					<FormFolder class="_formBlock">
						<template #label>Active Email Validation</template>
						<template v-if="enableActiveEmailValidation" #suffix
							>Enabled</template
						>
						<template v-else #suffix>Disabled</template>

						<div class="_formRoot">
							<span class="_formBlock">{{
								i18n.ts.activeEmailValidationDescription
							}}</span>
							<FormSwitch
								v-model="enableActiveEmailValidation"
								class="_formBlock"
								@update:modelValue="save"
							>
								<template #label>Enable</template>
							</FormSwitch>
						</div>
					</FormFolder>

					<FormFolder class="_formBlock">
						<template #label>Log IP address</template>
						<template v-if="enableIpLogging" #suffix
							>Enabled</template
						>
						<template v-else #suffix>Disabled</template>

						<div class="_formRoot">
							<FormSwitch
								v-model="enableIpLogging"
								class="_formBlock"
								@update:modelValue="save"
							>
								<template #label>Enable</template>
							</FormSwitch>
						</div>
					</FormFolder>

					<FormFolder class="_formBlock">
						<template #label>Summaly Proxy</template>

						<div class="_formRoot">
							<FormInput
								v-model="summalyProxy"
								class="_formBlock"
							>
								<template #prefix
									><i class="ph-link-simple ph-bold ph-lg"></i
								></template>
								<template #label>Summaly Proxy URL</template>
							</FormInput>

							<FormButton primary class="_formBlock" @click="save"
								><i
									class="ph-floppy-disk-back ph-bold ph-lg"
								></i>
								{{ i18n.ts.save }}</FormButton
							>
						</div>
					</FormFolder>

					<FormFolder class="_formBlock">
						<template #label>{{
							i18n.ts.instanceSecurity
						}}</template>

						<div class="_formRoot">
							<FormSwitch
								v-if="!privateMode"
								v-model="secureMode"
							>
								<template #label>{{
									i18n.ts.secureMode
								}}</template>
								<template #caption>{{
									i18n.ts.secureModeInfo
								}}</template>
							</FormSwitch>
							<FormSwitch v-model="privateMode">
								<template #label>{{
									i18n.ts.privateMode
								}}</template>
								<template #caption>{{
									i18n.ts.privateModeInfo
								}}</template>
							</FormSwitch>
							<FormTextarea
								v-if="privateMode"
								v-model="allowedHosts"
							>
								<template #label>{{
									i18n.ts.allowedInstances
								}}</template>
								<template #caption>{{
									i18n.ts.allowedInstancesDescription
								}}</template>
							</FormTextarea>
							<FormButton
								primary
								class="_formBlock"
								@click="saveInstance"
								><i
									class="ph-floppy-disk-back ph-bold ph-lg"
								></i>
								{{ i18n.ts.save }}</FormButton
							>
						</div>
					</FormFolder>
				</div>
			</FormSuspense>
		</MkSpacer>
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import {} from "vue";
import XBotProtection from "./bot-protection.vue";
import FormFolder from "@/components/form/folder.vue";
import FormRadios from "@/components/form/radios.vue";
import FormSwitch from "@/components/form/switch.vue";
import FormInfo from "@/components/MkInfo.vue";
import FormSuspense from "@/components/form/suspense.vue";
import FormRange from "@/components/form/range.vue";
import FormInput from "@/components/form/input.vue";
import FormTextarea from "@/components/form/textarea.vue";
import FormButton from "@/components/MkButton.vue";
import * as os from "@/os";
import { fetchInstance } from "@/instance";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";

let summalyProxy: string = $ref("");
let enableHcaptcha: boolean = $ref(false);
let enableRecaptcha: boolean = $ref(false);
let enableIpLogging: boolean = $ref(false);
let enableActiveEmailValidation: boolean = $ref(false);

let secureMode: boolean = $ref(false);
let privateMode: boolean = $ref(false);
let allowedHosts: string = $ref("");

async function init() {
	const meta = await os.api("admin/meta");
	summalyProxy = meta.summalyProxy;
	enableHcaptcha = meta.enableHcaptcha;
	enableRecaptcha = meta.enableRecaptcha;
	enableIpLogging = meta.enableIpLogging;
	enableActiveEmailValidation = meta.enableActiveEmailValidation;

	secureMode = meta.secureMode;
	privateMode = meta.privateMode;
	allowedHosts = meta.allowedHosts.join("\n");
}

function save() {
	os.apiWithDialog("admin/update-meta", {
		summalyProxy,
		enableIpLogging,
		enableActiveEmailValidation,
	}).then(() => {
		fetchInstance();
	});
}

function saveInstance() {
	os.apiWithDialog("admin/update-meta", {
		secureMode,
		privateMode,
		allowedHosts: allowedHosts.split("\n"),
	}).then(() => {
		fetchInstance();
	});
}

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata({
	title: i18n.ts.security,
	icon: "ph-lock ph-bold ph-lg",
});
</script>
