<template>
	<MkSpacer :content-max="800">
		<div v-if="$i">
			<div v-if="state == 'waiting'" class="waiting _section">
				<div class="_content">
					<MkLoading />
				</div>
			</div>
			<div v-if="state == 'denied'" class="denied _section">
				<div class="_content">
					<p>{{ i18n.ts._auth.denied }}</p>
				</div>
			</div>
			<div v-else-if="state == 'error'" class="error _section">
				<div class="_content">
					<p>{{ message }}</p>
				</div>
			</div>
			<div v-else-if="state == 'accepted-oob'" class="accepted-oob _section">
				<div class="_content">
					<p>{{ i18n.ts._auth.copyAsk }}</p>
					<pre>{{ code }}</pre>
				</div>
			</div>
			<div v-else-if="state == 'accepted'" class="accepted _section">
				<div class="_content">
					<p>
						{{ i18n.ts._auth.callback }}<MkEllipsis />
					</p>
				</div>
			</div>
			<div v-else class="_section">
				<div v-if="name" class="_title">
					{{ i18n.t("_auth.shareAccess", { name: name }) }}
				</div>
				<div v-else class="_title">
					{{ i18n.ts._auth.shareAccessAsk }}
				</div>
				<div class="_content">
					<p>{{ i18n.ts._auth.permissionAsk }}</p>
					<div :class="[$style.permissions]">
						<div
								v-for="p in _scopes"
								:key="p"
								:class="[$style.permission]"
						>
							<i
									:class="[`ph-${getIcon(p)}`]"
									class="ph-bold ph-xl"
									style="margin-right: 0.5rem"
							></i>
							<span class="monospace">{{ p }}</span>
						</div>
					</div>
				</div>
				<div class="_footer">
					<MkButton inline @click="deny">{{
							i18n.ts.cancel
						}}</MkButton>
					<MkButton inline primary @click="accept">{{
							i18n.ts.accept
						}}</MkButton>
				</div>
			</div>
		</div>
		<div v-else class="signin">
			<MkSignin @login="onLogin" />
		</div>
	</MkSpacer>
</template>

<script lang="ts" setup>
import {} from "vue";
import MkSignin from "@/components/MkSignin.vue";
import MkButton from "@/components/MkButton.vue";
import * as os from "@/os";
import { $i, login } from "@/account";
import { appendQuery, query } from "@/scripts/url";
import { i18n } from "@/i18n";

const props = defineProps<{
	response_type: string;
	client_id: string;
	redirect_uri: string;
	scope?: string;
	force_login?: boolean;
	lang?: string;
}>();

const _scopes = props.scope?.split(" ") ?? ['read'];

let state = $ref<string | null>(null);
let code = $ref<string | null>(null);
let name = $ref<string | null>(null);
let message = $ref<string>('Unknown error occurred');

if ($i) {
	await os.apiJson("v1/iceshrimp/apps/info", {
		client_id: props.client_id,
	}).then(res => {
		name = res.name;
	});
}

const getUrlParams = () =>
		window.location.search
				.substring(1)
				.split("&")
				.reduce((result, query) => {
					const [k, v] = query.split("=");
					result[k] = decodeURIComponent(v);
					return result;
				}, {});

const redirectUri = getUrlParams()['redirect_uri'];
if (redirectUri !== props.redirect_uri)
	console.warn(`Mismatching redirect_uris between props (${props.redirect_uri}) and getUrlParams (${redirectUri})`);

function getIcon(p: string) {
	if (p.startsWith("write")) return "pencil-simple";
	else if(p.startsWith("read")) return "eye";
	else if (p.startsWith("push")) return "bell-ringing";
	else if(p.startsWith("follow")) return "users";
	else return "check-fat";
}

async function accept(): Promise<void> {
	state = "waiting";
	const res = await os.apiJson("v1/iceshrimp/auth/code", {
		client_id: props.client_id,
		redirect_uri: redirectUri,
		scopes: _scopes,
	}).catch(r => {
		message = r;
		state = 'error';
		throw r;
	});

	if (props.redirect_uri !== 'urn:ietf:wg:oauth:2.0:oob') {
		state = "accepted";
		location.href = appendQuery(
				redirectUri,
				query({
					code: res.code,
				}),
		);
	}
	else {
		code = res.code;
		state = "accepted-oob";
	}
}

function deny(): void {
	state = "denied";
}

async function onLogin(res): Promise<void> {
	await login(res.i);
}
</script>

<style lang="scss" module>
.monospace {
	font-family: monospace;
}

.permissions {
	display: flex;
	flex-wrap: wrap;
	gap: 1rem;
	margin-bottom: 2rem;
}

.permission {
	display: inline-flex;
	padding: 0.5rem 1rem;
	border-radius: var(--radius);
	background-color: var(--buttonBg);
	color: var(--fg);
}
</style>