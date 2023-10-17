import XTutorial from "../components/MkTutorialDialog.vue";
import { defaultStore } from "@/store";
import { instance } from "@/instance";
import { host } from "@/config";
import * as os from "@/os";
import { i18n } from "@/i18n";
import icon from "@/scripts/icon";

export function openHelpMenu_(ev: MouseEvent) {
	os.popupMenu(
		[
			{
				text: instance.name ?? host,
				type: "label",
			},
			{
				type: "link",
				text: i18n.ts.instanceInfo,
				icon: `${icon("ph-info")}`,
				to: "/about",
			},
			{
				type: "link",
				text: i18n.ts.aboutFirefish,
				icon: `${icon("ph-lightbulb")}`,
				to: "/about-firefish",
			},
			instance.tosUrl
				? {
						type: "button",
						text: i18n.ts.tos,
						icon: `${icon("ph-scroll")}`,
						action: () => {
							window.open(instance.tosUrl, "_blank");
						},
				  }
				: null,
			{
				type: "button",
				text: i18n.ts.apps,
				icon: `${icon("ph-device-mobile")}`,
				action: () => {
					window.open("https://joinfirefish.org/apps", "_blank");
				},
			},
			{
				type: "button",
				action: async () => {
					defaultStore.set("tutorial", 0);
					os.popup(XTutorial, {}, {}, "closed");
				},
				text: i18n.ts.replayTutorial,
				icon: `${icon("ph-circle-wavy-question")}`,
			},
			null,
			{
				type: "parent",
				text: i18n.ts.developer,
				icon: `${icon("ph-code")}`,
				children: [
					{
						type: "link",
						to: "/api-console",
						text: "API Console",
						icon: `${icon("ph-terminal-window")}`,
					},
					{
						text: i18n.ts.document,
						icon: `${icon("ph-file-doc")}`,
						action: () => {
							window.open("/api-doc", "_blank");
						},
					},
					{
						type: "link",
						to: "/scratchpad",
						text: "AiScript Scratchpad",
						icon: `${icon("ph-scribble-loop")}`,
					},
				],
			},
		],
		ev.currentTarget ?? ev.target,
	);
}
