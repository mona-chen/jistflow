<template>
	<StickyContainer>
		<template #header>
			<PageHeader :actions="headerActions" :tabs="headerTabs" />
		</template>
		<Spacer :content-max="700">
			<div class="_formRoot">
				<div class="_formBlock">
					<Input
						v-model="endpoint"
						:datalist="endpoints"
						class="_formBlock"
						@update:modelValue="onEndpointChange()"
					>
						<template #label>Endpoint</template>
					</Input>
					<Textarea v-model="body" class="_formBlock" code>
						<template #label>Params (JSON or JSON5)</template>
					</Textarea>
					<Switch v-model="withCredential" class="_formBlock">
						With credential
					</Switch>
					<Button
						class="_formBlock"
						primary
						:disabled="sending"
						@click="send"
					>
						<template v-if="sending">
							<Ellipsis />
						</template>
						<template v-else
							><i class="ph-paper-plane-tilt ph-bold ph-lg"></i>
							Send</template
						>
					</Button>
				</div>
				<div v-if="res" class="_formBlock">
					<Textarea v-model="res" code readonly tall>
						<template #label>Response</template>
					</Textarea>
				</div>
			</div>
		</Spacer>
	</StickyContainer>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import JSON5 from "json5";
import { Endpoints } from "iceshrimp-js";
import Button from "@/components/Button.vue";
import Input from "@/components/form/Input.vue";
import Textarea from "@/components/form/Textarea.vue";
import Switch from "@/components/form/Switch.vue";
import * as os from "@/os";
import { definePageMetadata } from "@/scripts/page-metadata";

const body = ref("{}");
const endpoint = ref("");
const endpoints = ref<any[]>([]);
const sending = ref(false);
const res = ref("");
const withCredential = ref(true);

os.api("endpoints").then((endpointResponse) => {
	endpoints.value = endpointResponse;
});

function send() {
	sending.value = true;
	const requestBody = JSON5.parse(body.value);
	os.api(
		endpoint.value as keyof Endpoints,
		requestBody,
		requestBody.i || (withCredential.value ? undefined : null),
	).then(
		(resp) => {
			sending.value = false;
			res.value = JSON5.stringify(resp, null, 2);
		},
		(err) => {
			sending.value = false;
			res.value = JSON5.stringify(err, null, 2);
		},
	);
}

function onEndpointChange() {
	os.api(
		"endpoint",
		{ endpoint: endpoint.value },
		withCredential.value ? undefined : null,
	).then((resp) => {
		const endpointBody = {};
		for (const p of resp.params) {
			endpointBody[p.name] =
				p.type === "String"
					? ""
					: p.type === "Number"
					? 0
					: p.type === "Boolean"
					? false
					: p.type === "Array"
					? []
					: p.type === "Object"
					? {}
					: null;
		}
		body.value = JSON5.stringify(endpointBody, null, 2);
	});
}

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata({
	title: "API console",
	icon: "ph-terminal-window ph-bold ph-lg",
});
</script>
