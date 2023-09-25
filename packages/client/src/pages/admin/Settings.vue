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
			<Spacer :content-max="700" :margin-min="16" :margin-max="32">
				<FormSuspense :p="init">
					<div class="_formRoot">
						<FormInput v-model="name" class="_formBlock">
							<template #label>{{
								i18n.ts.instanceName
							}}</template>
						</FormInput>

						<FormTextarea v-model="description" class="_formBlock">
							<template #label>{{
								i18n.ts.instanceDescription
							}}</template>
						</FormTextarea>

						<FormInput v-model="tosUrl" class="_formBlock">
							<template #prefix
								><i class="ph-link-simple ph-bold ph-lg"></i
							></template>
							<template #label>{{ i18n.ts.tosUrl }}</template>
						</FormInput>

						<FormSplit :min-width="300">
							<FormInput
								v-model="maintainerName"
								class="_formBlock"
							>
								<template #label>{{
									i18n.ts.maintainerName
								}}</template>
							</FormInput>

							<FormInput
								v-model="maintainerEmail"
								type="email"
								class="_formBlock"
							>
								<template #prefix
									><i
										class="ph-envelope-simple-open ph-bold ph-lg"
									></i
								></template>
								<template #label>{{
									i18n.ts.maintainerEmail
								}}</template>
							</FormInput>

							<FormInput
								v-model="donationLink"
								class="_formBlock"
							>
								<template #prefix
									><i class="ph-hand-heart ph-bold ph-lg"></i
								></template>
								<template #label>{{
									i18n.ts.donationLink
								}}</template>
							</FormInput>
						</FormSplit>

						<FormTextarea v-model="pinnedUsers" class="_formBlock">
							<template #label>{{
								i18n.ts.pinnedUsers
							}}</template>
							<template #caption>{{
								i18n.ts.pinnedUsersDescription
							}}</template>
						</FormTextarea>

						<FormSection>
							<FormSwitch
								v-model="enableRegistration"
								class="_formBlock"
							>
								<template #label>{{
									i18n.ts.enableRegistration
								}}</template>
							</FormSwitch>

							<FormSwitch
								v-model="emailRequiredForSignup"
								class="_formBlock"
							>
								<template #label>{{
									i18n.ts.emailRequiredForSignup
								}}</template>
							</FormSwitch>
						</FormSection>

						<FormSection>
							<FormSwitch
								v-model="enableRecommendedTimeline"
								class="_formBlock"
								>{{
									i18n.ts.enableRecommendedTimeline
								}}</FormSwitch
							>
							<FormTextarea
								v-model="recommendedInstances"
								class="_formBlock"
							>
								<template #label>{{
									i18n.ts.recommendedInstances
								}}</template>
								<template #caption>{{
									i18n.ts.recommendedInstancesDescription
								}}</template>
							</FormTextarea>
						</FormSection>

						<FormSection>
							<FormSwitch
								v-model="enableLocalTimeline"
								class="_formBlock"
								>{{ i18n.ts.enableLocalTimeline }}
							</FormSwitch>
							<FormSwitch
								v-model="enableGlobalTimeline"
								class="_formBlock"
								>{{ i18n.ts.enableGlobalTimeline }}
							</FormSwitch>
							<FormInfo class="_formBlock">{{
								i18n.ts.disablingTimelinesInfo
							}}</FormInfo>
						</FormSection>

						<FormSection>
							<Radios
								v-model="defaultReaction"
								class="_formBlock"
							>
								<template #label>{{
									i18n.ts.defaultReaction
								}}</template>
								<option value="⭐">
									<Emoji emoji="⭐" style="height: 1.7em" />
								</option>
								<option value="👍">
									<Emoji emoji="👍" style="height: 1.7em" />
								</option>
								<option value="❤️">
									<Emoji emoji="❤️" style="height: 1.7em" />
								</option>
								<option value="custom">
									<FormInput
										v-model="defaultReactionCustom"
										class="_formBlock"
										:small="true"
										:placeholder="`:custom:`"
										style="margin: 0 0 !important"
									/>
								</option>
							</Radios>
						</FormSection>

						<FormSection>
							<template #label>{{ i18n.ts.theme }}</template>

							<FormInput v-model="iconUrl" class="_formBlock">
								<template #prefix
									><i class="ph-link-simple ph-bold ph-lg"></i
								></template>
								<template #label>{{
									i18n.ts.iconUrl
								}}</template>
							</FormInput>

							<FormInput v-model="bannerUrl" class="_formBlock">
								<template #prefix
									><i class="ph-link-simple ph-bold ph-lg"></i
								></template>
								<template #label>{{
									i18n.ts.bannerUrl
								}}</template>
							</FormInput>

							<FormInput
								v-model="logoImageUrl"
								class="_formBlock"
							>
								<template #prefix
									><i class="ph-link-simple ph-bold ph-lg"></i
								></template>
								<template #label>{{
									i18n.ts.logoImageUrl
								}}</template>
							</FormInput>

							<FormInput
								v-model="backgroundImageUrl"
								class="_formBlock"
							>
								<template #prefix
									><i class="ph-link-simple ph-bold ph-lg"></i
								></template>
								<template #label>{{
									i18n.ts.backgroundImageUrl
								}}</template>
							</FormInput>

							<FormInput v-model="themeColor" class="_formBlock">
								<template #prefix
									><i class="ph-palette ph-bold ph-lg"></i
								></template>
								<template #label>{{
									i18n.ts.themeColor
								}}</template>
								<template #caption>#RRGGBB</template>
							</FormInput>

							<FormTextarea
								v-model="defaultLightTheme"
								class="_formBlock"
							>
								<template #label>{{
									i18n.ts.instanceDefaultLightTheme
								}}</template>
								<template #caption>{{
									i18n.ts.instanceDefaultThemeDescription
								}}</template>
							</FormTextarea>

							<FormTextarea
								v-model="defaultDarkTheme"
								class="_formBlock"
							>
								<template #label>{{
									i18n.ts.instanceDefaultDarkTheme
								}}</template>
								<template #caption>{{
									i18n.ts.instanceDefaultThemeDescription
								}}</template>
							</FormTextarea>
						</FormSection>

						<FormSection>
							<template #label>{{ i18n.ts.splash }}</template>

							<FormTextarea
								v-model="customMOTD"
								class="_formBlock"
							>
								<template #label>{{
									i18n.ts.customMOTD
								}}</template>
								<template #caption>{{
									i18n.ts.customMOTDDescription
								}}</template>
							</FormTextarea>

							<FormTextarea
								v-model="customSplashIcons"
								class="_formBlock"
							>
								<template #label>{{
									i18n.ts.customSplashIcons
								}}</template>
								<template #caption>{{
									i18n.ts.customSplashIconsDescription
								}}</template>
							</FormTextarea>
						</FormSection>

						<FormSection>
							<template #label>{{ i18n.ts.files }}</template>

							<FormSwitch
								v-model="cacheRemoteFiles"
								class="_formBlock"
							>
								<template #label>{{
									i18n.ts.cacheRemoteFiles
								}}</template>
								<template #caption>{{
									i18n.ts.cacheRemoteFilesDescription
								}}</template>
							</FormSwitch>

							<FormSplit :min-width="280">
								<FormInput
									v-model="localDriveCapacityMb"
									type="number"
									class="_formBlock"
								>
									<template #label>{{
										i18n.ts.driveCapacityPerLocalAccount
									}}</template>
									<template #suffix>MB</template>
									<template #caption>{{
										i18n.ts.inMb
									}}</template>
								</FormInput>

								<FormInput
									v-model="remoteDriveCapacityMb"
									type="number"
									:disabled="!cacheRemoteFiles"
									class="_formBlock"
								>
									<template #label>{{
										i18n.ts.driveCapacityPerRemoteAccount
									}}</template>
									<template #suffix>MB</template>
									<template #caption>{{
										i18n.ts.inMb
									}}</template>
								</FormInput>
							</FormSplit>
						</FormSection>

						<FormSection>
							<template #label>Server Performance</template>
							<FormSwitch
								v-model="enableServerMachineStats"
								class="_formBlock"
							>
								<template #label>{{
									i18n.ts.enableServerMachineStats
								}}</template>
							</FormSwitch>

							<FormSwitch
								v-model="enableIdenticonGeneration"
								class="_formBlock"
							>
								<template #label>{{
									i18n.ts.enableIdenticonGeneration
								}}</template>
							</FormSwitch>
						</FormSection>

						<FormSection>
							<template #label>DeepL Translation</template>

							<FormInput
								v-model="deeplAuthKey"
								class="_formBlock"
							>
								<template #prefix
									><i class="ph-key ph-bold ph-lg"></i
								></template>
								<template #label>DeepL Auth Key</template>
							</FormInput>
							<FormSwitch v-model="deeplIsPro" class="_formBlock">
								<template #label>Pro account</template>
							</FormSwitch>
						</FormSection>

						<FormSection>
							<template #label>Libre Translate</template>

							<FormInput
								v-model="libreTranslateApiUrl"
								class="_formBlock"
							>
								<template #prefix
									><i class="ph-link ph-bold ph-lg"></i
								></template>
								<template #label
									>Libre Translate API URL</template
								>
							</FormInput>

							<FormInput
								v-model="libreTranslateApiKey"
								class="_formBlock"
							>
								<template #prefix
									><i class="ph-key ph-bold ph-lg"></i
								></template>
								<template #label
									>Libre Translate API Key</template
								>
							</FormInput>
						</FormSection>
					</div>
				</FormSuspense>
			</Spacer>
		</StickyContainer>
	</div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import FormSwitch from "@/components/form/Switch.vue";
import FormInput from "@/components/form/Input.vue";
import FormTextarea from "@/components/form/Textarea.vue";
import FormInfo from "@/components/Info.vue";
import FormSection from "@/components/form/Section.vue";
import FormSplit from "@/components/form/Split.vue";
import FormSuspense from "@/components/form/Suspense.vue";
import Radios from "@/components/form/Radios.vue";
import * as os from "@/os";
import { fetchInstance } from "@/instance";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";

let name: string | null = $ref(null);
let description: string | null = $ref(null);
let tosUrl: string | null = $ref(null);
let maintainerName: string | null = $ref(null);
let maintainerEmail: string | null = $ref(null);
let donationLink: string | null = $ref(null);
let iconUrl: string | null = $ref(null);
let bannerUrl: string | null = $ref(null);
let logoImageUrl: string | null = $ref(null);
let backgroundImageUrl: string | null = $ref(null);
let themeColor: any = $ref(null);
let defaultLightTheme: any = $ref(null);
let defaultDarkTheme: any = $ref(null);
let enableLocalTimeline: boolean = $ref(false);
let enableGlobalTimeline: boolean = $ref(false);
let enableRecommendedTimeline: boolean = $ref(false);
let pinnedUsers: string = $ref("");
let customMOTD: string = $ref("");
let recommendedInstances: string = $ref("");
let customSplashIcons: string = $ref("");
let cacheRemoteFiles: boolean = $ref(false);
let localDriveCapacityMb: any = $ref(0);
let remoteDriveCapacityMb: any = $ref(0);
let enableRegistration: boolean = $ref(false);
let emailRequiredForSignup: boolean = $ref(false);
let deeplAuthKey: string = $ref("");
let deeplIsPro: boolean = $ref(false);
let libreTranslateApiUrl: string = $ref("");
let libreTranslateApiKey: string = $ref("");
let defaultReaction: string = $ref("");
let defaultReactionCustom: string = $ref("");
let enableServerMachineStats: boolean = $ref(false);
let enableIdenticonGeneration: boolean = $ref(false);

async function init() {
	const meta = await os.api("admin/meta");
	if (!meta) throw new Error("No meta");
	name = meta.name;
	description = meta.description;
	tosUrl = meta.tosUrl;
	iconUrl = meta.iconUrl;
	bannerUrl = meta.bannerUrl;
	logoImageUrl = meta.logoImageUrl;
	backgroundImageUrl = meta.backgroundImageUrl;
	themeColor = meta.themeColor;
	defaultLightTheme = meta.defaultLightTheme;
	defaultDarkTheme = meta.defaultDarkTheme;
	maintainerName = meta.maintainerName;
	maintainerEmail = meta.maintainerEmail;
	donationLink = meta.donationLink;
	enableLocalTimeline = !meta.disableLocalTimeline;
	enableGlobalTimeline = !meta.disableGlobalTimeline;
	enableRecommendedTimeline = !meta.disableRecommendedTimeline;
	pinnedUsers = meta.pinnedUsers.join("\n");
	customMOTD = meta.customMOTD.join("\n");
	customSplashIcons = meta.customSplashIcons.join("\n");
	recommendedInstances = meta.recommendedInstances.join("\n");
	cacheRemoteFiles = meta.cacheRemoteFiles;
	localDriveCapacityMb = meta.driveCapacityPerLocalUserMb;
	remoteDriveCapacityMb = meta.driveCapacityPerRemoteUserMb;
	enableRegistration = !meta.disableRegistration;
	emailRequiredForSignup = meta.emailRequiredForSignup;
	deeplAuthKey = meta.deeplAuthKey;
	deeplIsPro = meta.deeplIsPro;
	libreTranslateApiUrl = meta.libreTranslateApiUrl;
	libreTranslateApiKey = meta.libreTranslateApiKey;
	defaultReaction = ["⭐", "👍", "❤️"].includes(meta.defaultReaction)
		? meta.defaultReaction
		: "custom";
	defaultReactionCustom = ["⭐", "👍", "❤️"].includes(meta.defaultReaction)
		? ""
		: meta.defaultReaction;
	enableServerMachineStats = meta.enableServerMachineStats;
	enableIdenticonGeneration = meta.enableIdenticonGeneration;
}

function save() {
	if (defaultReaction === "custom") {
		defaultReaction = defaultReactionCustom;
	}
	os.apiWithDialog("admin/update-meta", {
		name,
		description,
		tosUrl,
		iconUrl,
		bannerUrl,
		logoImageUrl,
		backgroundImageUrl,
		themeColor: themeColor === "" ? null : themeColor,
		defaultLightTheme: defaultLightTheme === "" ? null : defaultLightTheme,
		defaultDarkTheme: defaultDarkTheme === "" ? null : defaultDarkTheme,
		maintainerName,
		maintainerEmail,
		donationLink,
		disableLocalTimeline: !enableLocalTimeline,
		disableGlobalTimeline: !enableGlobalTimeline,
		disableRecommendedTimeline: !enableRecommendedTimeline,
		pinnedUsers: pinnedUsers.split("\n"),
		customMOTD: customMOTD.split("\n"),
		customSplashIcons: customSplashIcons.split("\n"),
		recommendedInstances: recommendedInstances.split("\n"),
		cacheRemoteFiles,
		localDriveCapacityMb: parseInt(localDriveCapacityMb, 10),
		remoteDriveCapacityMb: parseInt(remoteDriveCapacityMb, 10),
		disableRegistration: !enableRegistration,
		emailRequiredForSignup,
		deeplAuthKey,
		deeplIsPro,
		libreTranslateApiUrl,
		libreTranslateApiKey,
		defaultReaction,
		enableServerMachineStats,
		enableIdenticonGeneration,
	}).then(() => {
		fetchInstance();
	});
}

const headerActions = $computed(() => [
	{
		asFullButton: true,
		icon: "ph-check ph-bold ph-lg",
		text: i18n.ts.save,
		handler: save,
	},
]);

const headerTabs = $computed(() => []);

definePageMetadata({
	title: i18n.ts.general,
	icon: "ph-gear-six ph-bold ph-lg",
});
</script>
