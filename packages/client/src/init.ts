/**
 * Client entry point
 */

// https://vitejs.dev/config/build-options.html#build-modulepreload
import "vite/modulepreload-polyfill";

import { Device, DeviceInfo } from "@capacitor/device";
export let storedDeviceInfo: DeviceInfo;

// #v-ifdef VITE_CAPACITOR
console.log("Compiled for Capacitor");
const res = await Device.getInfo();
{
	console.log(res);
	storedDeviceInfo = res;
	if (!localStorage.getItem("lang")) {
		localStorage.setItem("lang", "en-US");
		document.location.href = '/';
	}
	const lang: string = localStorage.getItem("lang") || "";
	const lang_res = await fetch(`/assets/locales/${lang}.${version}.json`);
	if (lang_res.status === 200) {
		localStorage.setItem("lang", lang);
		localStorage.setItem("locale", await lang_res.text());
		localStorage.setItem("localeVersion", version);
		document.location.href = '/';
	}
}

// #v-else
console.log("Compiled for Web");
// #v-endif

import "@/style.scss";
import "@phosphor-icons/web/bold";
import "@phosphor-icons/web/fill";

//#region account indexedDB migration
import { set } from "@/scripts/idb-proxy";

if (localStorage.getItem("accounts") != null) {
	set("accounts", JSON.parse(localStorage.getItem("accounts")));
	localStorage.removeItem("accounts");
}
//#endregion

import {
	computed,
	createApp,
	watch,
	markRaw,
	version as vueVersion,
	defineAsyncComponent,
} from "vue";
import { compareVersions } from "compare-versions";
import JSON5 from "json5";

import widgets from "@/widgets";
import directives from "@/directives";
import components from "@/components";
import { version, ui, lang, host } from "@/config";
import { applyTheme } from "@/scripts/theme";
import { isDeviceDarkmode } from "@/scripts/is-device-darkmode";
import { i18n } from "@/i18n";
import { confirm, alert, post, popup, toast } from "@/os";
import { stream } from "@/stream";
import * as sound from "@/scripts/sound";
import { $i, refreshAccount, login, updateAccount, signout } from "@/account";
import { defaultStore, ColdDeviceStorage } from "@/store";
import { fetchInstance, instance } from "@/instance";
import { makeHotkey } from "@/scripts/hotkey";
import { search } from "@/scripts/search";
import { deviceKind } from "@/scripts/device-kind";
import { initializeSw } from "@/scripts/initialize-sw";
import { reloadChannel } from "@/scripts/unison-reload";
import { reactionPicker } from "@/scripts/reaction-picker";
import { getUrlWithoutLoginId } from "@/scripts/login-id";
import { getAccountFromId } from "@/scripts/get-account-from-id";
import { App } from "@capacitor/app";
import lightThemeDefault from "@/themes/l-rosepinedawn.json5";
import OneSignal from "onesignal-cordova-plugin";
// #v-ifdef VITE_CAPACITOR
const onesignal_app_id = "efe09597-0778-4156-97b7-0bf8f52c21a7";
// #v-endif
(async () => {
	console.info(`Calckey v${version}`);

	if (_DEV_) {
		console.warn("Development mode!!!");

		console.info(`vue ${vueVersion}`);

		(window as any).$i = $i;
		(window as any).$store = defaultStore;

		window.addEventListener("error", (event) => {
			console.error(event);
			/*
			alert({
				type: 'error',
				title: 'DEV: Unhandled error',
				text: event.message
			});
			*/
		});

		window.addEventListener("unhandledrejection", (event) => {
			console.error(event);
			/*
			alert({
				type: 'error',
				title: 'DEV: Unhandled promise rejection',
				text: event.reason
			});
			*/
		});
	}

	// タッチデバイスでCSSの:hoverを機能させる
	document.addEventListener("touchend", () => {}, { passive: true });

	// 一斉リロード
	reloadChannel.addEventListener("message", (path) => {
		if (path !== null) location.href = path;
		else location.reload();
	});

	//#region SEE: https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
	// TODO: いつの日にか消したい
	const vh = window.innerHeight * 0.01;
	document.documentElement.style.setProperty("--vh", `${vh}px`);
	window.addEventListener("resize", () => {
		const vh = window.innerHeight * 0.01;
		document.documentElement.style.setProperty("--vh", `${vh}px`);
	});
	//#endregion

	let isMobileApp = false;
	// #v-ifdef VITE_CAPACITOR
	isMobileApp = true;
	// #v-endif

	// If mobile, insert the viewport meta tag
	if (isMobileApp || ["smartphone", "tablet"].includes(deviceKind)) {
		const viewport = document.getElementsByName("viewport").item(0);
		viewport.setAttribute(
			"content",
			`${viewport.getAttribute(
				"content",
			)}, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover`,
		);
	}

	//#region Set lang attr
	const html = document.documentElement;
	html.setAttribute("lang", lang);
	// #v-ifdef VITE_CAPACITOR
	html.setAttribute("class", res.platform);
	const css = localStorage.getItem("customCss") || "";
  if (css) {
    const cssNode = document.createElement("style");
    const cssTextNode = document.createTextNode(css);
    cssNode.appendChild(cssTextNode);
    document.body.appendChild(cssNode);
  }

  if (defaultStore.reactiveState.darkMode.value) {
    const style = document.createElement("style");
    style.innerText = "    --bg: rgb(12, 18, 16);";
    document.head.appendChild(style);
  }
	// #v-endif
	//#endregion

	//#region loginId
	const params = new URLSearchParams(location.search);
	const loginId = params.get("loginId");

	if (loginId) {
		const target = getUrlWithoutLoginId(location.href);

		if (!$i || $i.id !== loginId) {
			const account = await getAccountFromId(loginId);
			if (account) {
				await login(account.token, target);
				// #v-ifdef VITE_CAPACITOR
				await afterLoginSetup();
				// #v-endif
			}
		}

		history.replaceState({ misskey: "loginId" }, "", target);
	}

	//#endregion

	//#region Fetch user
	if ($i?.token) {
		if (_DEV_) {
			console.log("account cache found. refreshing...");
		}

		await refreshAccount();
		// #v-ifdef VITE_CAPACITOR
		await afterLoginSetup();
		// #v-endif
	} else {
		if (_DEV_) {
			console.log("no account cache found.");
		}

		// 連携ログインの場合用にCookieを参照する
		const i = (document.cookie.match(/igi=(\w+)/) || [null, null])[1];

		if (i != null && i !== "null") {
			if (_DEV_) {
				console.log("signing...");
			}

			try {
				document.body.innerHTML = "<div>Please wait...</div>";
				await login(i);
			} catch (err) {
				// Render the error screen
				// TODO: ちゃんとしたコンポーネントをレンダリングする(v10とかのトラブルシューティングゲーム付きのやつみたいな)
				document.body.innerHTML = '<div id="err">Oops!</div>';
			}
		} else {
			if (_DEV_) {
				console.log("not signed in");
			}
			// #v-ifdef VITE_CAPACITOR
			applyTheme(
				defaultStore.reactiveState.darkMode.value ?
				ColdDeviceStorage.get("darkTheme") :
				ColdDeviceStorage.get("lightTheme")
			)
			// #v-endif
		}
	}
	//#endregion
	// #v-ifdef VITE_CAPACITOR
	//...
	// #v-else
	const fetchInstanceMetaPromise = fetchInstance();

	fetchInstanceMetaPromise.then(() => {
		localStorage.setItem("v", instance.version);

		// Init service worker
		initializeSw();
	});
	// #v-endif
	const app = createApp(
		window.location.search === "?zen"
			? defineAsyncComponent(() => import("@/ui/zen.vue"))
			: !$i
			? defineAsyncComponent(() => import("@/ui/visitor.vue"))
			: ui === "deck"
			? defineAsyncComponent(() => import("@/ui/deck.vue"))
			: ui === "classic"
			? defineAsyncComponent(() => import("@/ui/classic.vue"))
			: defineAsyncComponent(() => import("@/ui/universal.vue")),
	);

	if (_DEV_) {
		app.config.performance = true;
	}

	app.config.globalProperties = {
		$i,
		$store: defaultStore,
		$instance: instance,
		$t: i18n.t,
		$ts: i18n.ts,
	};

	widgets(app);
	directives(app);
	components(app);

	const splash = document.getElementById("splash");
	// 念のためnullチェック(HTMLが古い場合があるため(そのうち消す))
	if (splash)
		splash.addEventListener("transitionend", () => {
			splash.remove();
		});

	// https://github.com/misskey-dev/misskey/pull/8575#issuecomment-1114239210
	// なぜかinit.tsの内容が2回実行されることがあるため、mountするdivを1つに制限する
	const rootEl = (() => {
		const MISSKEY_MOUNT_DIV_ID = "calckey_app";

		const currentEl = document.getElementById(MISSKEY_MOUNT_DIV_ID);

		if (currentEl) {
			console.warn("multiple import detected");
			return currentEl;
		}

		const rootEl = document.createElement("div");
		rootEl.id = MISSKEY_MOUNT_DIV_ID;
		document.body.appendChild(rootEl);
		return rootEl;
	})();

	app.mount(rootEl);

	// boot.jsのやつを解除
	window.onerror = null;
	window.onunhandledrejection = null;

// #v-ifdef VITE_CAPACITOR
//...
// #v-else
	reactionPicker.init();
// #v-endif	

	if (splash) {
		splash.style.opacity = "0";
		splash.style.pointerEvents = "none";
	}

	// クライアントが更新されたか？
	const lastVersion = localStorage.getItem("lastVersion");

	if (lastVersion !== version) {
		localStorage.setItem("lastVersion", version);

		// テーマリビルドするため
		localStorage.removeItem("theme");

		try {
			// 変なバージョン文字列来るとcompareVersionsでエラーになるため
			if (
				lastVersion != null &&
				compareVersions(version, lastVersion) === 1 &&
				defaultStore.state.showUpdates
			) {
				// ログインしてる場合だけ
				if ($i) {
					popup(
						defineAsyncComponent(() => import("@/components/MkUpdated.vue")),
						{},
						{},
						"closed",
					);
				}
			}
		} catch (err) {
			console.error(err);
		}
	}

	// #v-ifdef VITE_CAPACITOR
	App.addListener("backButton", (canGoBack) => {
		if (canGoBack) {
			history.back();
		} else {
			App.exitApp();
		}
	});
})();

async function afterLoginSetup() {
	if (!$i) return;
	const hotkeys = {
		d: (): void => {
			defaultStore.set("darkMode", !defaultStore.state.darkMode);
		},
		s: search,
		["p|n"]: post,
	};

	//shortcut
	document.addEventListener("keydown", makeHotkey(hotkeys));
	reactionPicker.init();
	const fetchInstanceMetaPromise = fetchInstance();

	fetchInstanceMetaPromise.then(() => {
		localStorage.setItem("v", instance.version);

		// Init service worker
		initializeSw();
	});

	applyTheme(
		defaultStore.reactiveState.darkMode.value ?
		ColdDeviceStorage.get("darkTheme") :
		ColdDeviceStorage.get("lightTheme")
	)
	// #v-endif

	// NOTE: この処理は必ず↑のクライアント更新時処理より後に来ること(テーマ再構築のため)
	watch(
		defaultStore.reactiveState.darkMode,
		(darkMode) => {
			applyTheme(
				darkMode
					? ColdDeviceStorage.get("darkTheme")
					: ColdDeviceStorage.get("lightTheme"),
			);
		},
		{ immediate: localStorage.theme == null },
	);

	const darkTheme = computed(ColdDeviceStorage.makeGetterSetter("darkTheme"));
	const lightTheme = computed(ColdDeviceStorage.makeGetterSetter("lightTheme"));

	watch(darkTheme, (theme) => {
		if (defaultStore.state.darkMode) {
			applyTheme(theme);
		}
	});

	watch(lightTheme, (theme) => {
		if (!defaultStore.state.darkMode) {
			applyTheme(theme);
		}
	});

	//#region Sync dark mode
	if (ColdDeviceStorage.get("syncDeviceDarkMode")) {
		defaultStore.set("darkMode", isDeviceDarkmode());
	}

	window.matchMedia("(prefers-color-scheme: dark)").addListener((mql) => {
		if (ColdDeviceStorage.get("syncDeviceDarkMode")) {
			defaultStore.set("darkMode", mql.matches);
		}
	});
	//#endregion

	// #v-ifdef VITE_CAPACITOR
	//...
	// #v-else
	fetchInstanceMetaPromise.then(() => {
		if (defaultStore.state.themeInitial) {
			if (instance.defaultLightTheme != null)
				ColdDeviceStorage.set(
					"lightTheme",
					JSON5.parse(instance.defaultLightTheme),
				);
			if (instance.defaultDarkTheme != null)
				ColdDeviceStorage.set(
					"darkTheme",
					JSON5.parse(instance.defaultDarkTheme),
				);
			defaultStore.set("themeInitial", false);
		}
	});
	// #v-endif

	watch(
		defaultStore.reactiveState.useBlurEffectForModal,
		(v) => {
			document.documentElement.style.setProperty(
				"--modalBgFilter",
				v ? "blur(4px)" : "none",
			);
		},
		{ immediate: true },
	);

	watch(
		defaultStore.reactiveState.useBlurEffect,
		(v) => {
			if (v && deviceKind !== "smartphone") {
				document.documentElement.style.removeProperty("--blur");
			} else {
				document.documentElement.style.setProperty("--blur", "none");
			}
		},
		{ immediate: true },
	);

	let reloadDialogShowing = false;
	stream.on("_disconnected_", async () => {
		if (defaultStore.state.serverDisconnectedBehavior === "reload") {
			location.reload();
		} else if (defaultStore.state.serverDisconnectedBehavior === "dialog") {
			if (reloadDialogShowing) return;
			reloadDialogShowing = true;
			const { canceled } = await confirm({
				type: "warning",
				title: i18n.ts.disconnectedFromServer,
				text: i18n.ts.reloadConfirm,
			});
			reloadDialogShowing = false;
			if (!canceled) {
				location.reload();
			}
		}
	});

	stream.on("emojiAdded", (emojiData) => {
		// TODO
		//store.commit('instance/set', );
	});

	for (const plugin of ColdDeviceStorage.get("plugins").filter(
		(p) => p.active,
	)) {
		import("./plugin").then(({ install }) => {
			install(plugin);
		});
	}

	// #v-ifdef VITE_CAPACITOR
	//...
	// #v-else
	const hotkeys = {
		d: (): void => {
			defaultStore.set("darkMode", !defaultStore.state.darkMode);
		},
		s: search,
	};
	// #v-endif

	if ($i) {
		// only add post shortcuts if logged in
		hotkeys["p|n"] = post;

		if ($i.isDeleted) {
			alert({
				type: "warning",
				text: i18n.ts.accountDeletionInProgress,
			});
		}

		const lastUsed = localStorage.getItem("lastUsed");
		if (lastUsed) {
			const lastUsedDate = parseInt(lastUsed, 10);
			// 二時間以上前なら
			if (Date.now() - lastUsedDate > 1000 * 60 * 60 * 2) {
				toast(
					i18n.t("welcomeBackWithName", {
						name: $i.name || $i.username,
					}),
				);
			}
		}
		localStorage.setItem("lastUsed", Date.now().toString());

		if ("Notification" in window) {
			// 許可を得ていなかったらリクエスト
			if (Notification.permission === "default") {
				Notification.requestPermission();
			}
		}

		const main = markRaw(stream.useChannel("main", null, "System"));

		// 自分の情報が更新されたとき
		main.on("meUpdated", (i) => {
			updateAccount(i);
		});

		main.on("readAllNotifications", () => {
			updateAccount({ hasUnreadNotification: false });
		});

		main.on("unreadNotification", () => {
			updateAccount({ hasUnreadNotification: true });
		});

		main.on("unreadMention", () => {
			updateAccount({ hasUnreadMentions: true });
		});

		main.on("readAllUnreadMentions", () => {
			updateAccount({ hasUnreadMentions: false });
		});

		main.on("unreadSpecifiedNote", () => {
			updateAccount({ hasUnreadSpecifiedNotes: true });
		});

		main.on("readAllUnreadSpecifiedNotes", () => {
			updateAccount({ hasUnreadSpecifiedNotes: false });
		});

		main.on("readAllMessagingMessages", () => {
			updateAccount({ hasUnreadMessagingMessage: false });
		});

		main.on("unreadMessagingMessage", () => {
			updateAccount({ hasUnreadMessagingMessage: true });
			sound.play("chatBg");
		});

		main.on("readAllAntennas", () => {
			updateAccount({ hasUnreadAntenna: false });
		});

		main.on("unreadAntenna", () => {
			updateAccount({ hasUnreadAntenna: true });
			sound.play("antenna");
		});

		main.on("readAllAnnouncements", () => {
			updateAccount({ hasUnreadAnnouncement: false });
		});

		main.on("readAllChannels", () => {
			updateAccount({ hasUnreadChannel: false });
		});

		main.on("unreadChannel", () => {
			updateAccount({ hasUnreadChannel: true });
			sound.play("channel");
		});

		// トークンが再生成されたとき
		// このままではMisskeyが利用できないので強制的にサインアウトさせる
		main.on("myTokenRegenerated", () => {
			signout();
		});
	}

// #v-ifdef VITE_CAPACITOR
	if (storedDeviceInfo.platform === "web") return;
	OneSignal.setAppId(onesignal_app_id);
	const deviceId = await Device.getId();
	OneSignal.setExternalUserId(deviceId.uuid);
	/*const res = await fetch(import.meta.env.VITE_NOTIFICATION_TOKEN_ENDPOINT, {
		method: "POST", // *GET, POST, PUT, DELETE, etc.
		mode: "cors", // no-cors, *cors, same-origin
		cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
		credentials: "same-origin", // include, *same-origin, omit
		headers: {
			"Content-Type": "application/json",
		},
		redirect: "follow", // manual, *follow, error
		referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
		body: JSON.stringify({
			misskey_token: $i.token,
			device_id: deviceId.uuid,
			instance_url: $i.instanceUrl,
		}),
	}).catch((err) => {
		console.error(err);
		// throw err
	});
	console.info(res);*/
	OneSignal.setNotificationOpenedHandler(function (jsonData) {
		console.log(`notificationOpenedCallback: ${JSON.stringify(jsonData)}`);
	});
	// Prompts the user for notification permissions.
	//    * Since this shows a generic native prompt, we recommend instead using an In-App Message to prompt for notification permission (See step 7) to better communicate to your users what notifications they will get.
	OneSignal.promptForPushNotificationsWithUserResponse(function (accepted) {
		console.log(`User accepted notifications: ${accepted}`);
	});
// #v-endif

	// shortcut
	document.addEventListener("keydown", makeHotkey(hotkeys));
// #v-ifdef VITE_CAPACITOR
}
// #v-else
})();
// #v-endif
