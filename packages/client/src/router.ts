import { AsyncComponentLoader, defineAsyncComponent, inject } from "vue";
import { Router } from "@/nirax";
import { $i, iAmModerator } from "@/account";
import Loading from "@/pages/Loading.vue";
import Error from "@/pages/Error.vue";

const page = (loader: AsyncComponentLoader<any>) =>
	defineAsyncComponent({
		loader: loader,
		loadingComponent: Loading,
		errorComponent: Error,
	});

export const routes = [
	{
		path: "/@:initUser/pages/:initPageName/view-source",
		component: page(() => import("./pages/page-editor/PageEditor.vue")),
	},
	{
		path: "/@:username/pages/:pageName",
		component: page(() => import("./pages/Page.vue")),
	},
	{
		path: "/@:acct/following",
		component: page(() => import("./pages/user/Following.vue")),
	},
	{
		path: "/@:acct/followers",
		component: page(() => import("./pages/user/Followers.vue")),
	},
	{
		name: "user",
		path: "/@:acct/:page?",
		component: page(() => import("./pages/user/Index.vue")),
	},
	{
		name: "note",
		path: "/notes/:noteId",
		component: page(() => import("./pages/Note.vue")),
	},
	{
		path: "/clips/:clipId",
		component: page(() => import("./pages/Clip.vue")),
	},
	{
		path: "/user-info/:userId",
		component: page(() => import("./pages/UserInfo.vue")),
	},
	{
		path: "/instance-info/:host",
		component: page(() => import("./pages/InstanceInfo.vue")),
	},
	{
		path: "/public/local",
		component: page(() => import("./pages/NoGraze.vue")),
	},
	{
		name: "settings",
		path: "/settings",
		component: page(() => import("./pages/settings/Index.vue")),
		loginRequired: true,
		children: [
			{
				path: "/profile",
				name: "profile",
				component: page(() => import("./pages/settings/Profile.vue")),
			},
			{
				path: "/privacy",
				name: "privacy",
				component: page(() => import("./pages/settings/Privacy.vue")),
			},
			{
				path: "/reaction",
				name: "reaction",
				component: page(() => import("./pages/settings/Reaction.vue")),
			},
			{
				path: "/drive",
				name: "drive",
				component: page(() => import("./pages/settings/Drive.vue")),
			},
			{
				path: "/notifications",
				name: "notifications",
				component: page(() => import("./pages/settings/Notifications.vue")),
			},
			{
				path: "/email",
				name: "email",
				component: page(() => import("./pages/settings/Email.vue")),
			},
			{
				path: "/integration",
				name: "integration",
				component: page(() => import("./pages/settings/Integration.vue")),
			},
			{
				path: "/security",
				name: "security",
				component: page(() => import("./pages/settings/Security.vue")),
			},
			{
				path: "/general",
				name: "general",
				component: page(() => import("./pages/settings/General.vue")),
			},
			{
				path: "/theme/install",
				name: "theme",
				component: page(() => import("./pages/settings/ThemeInstall.vue")),
			},
			{
				path: "/theme/manage",
				name: "theme",
				component: page(() => import("./pages/settings/ThemeManage.vue")),
			},
			{
				path: "/theme",
				name: "theme",
				component: page(() => import("./pages/settings/Theme.vue")),
			},
			{
				path: "/custom-css",
				name: "custom-css",
				component: page(() => import("./pages/settings/CustomCss.vue")),
			},
			{
				path: "/custom-katex-macro",
				name: "custom-katex-macro",
				component: page(() => import("./pages/settings/CustomKatexMacro.vue")),
			},
			{
				path: "/account-info",
				name: "account-info",
				component: page(() => import("./pages/settings/AccountInfo.vue")),
			},
			{
				path: "/navbar",
				name: "navbar",
				component: page(() => import("./pages/settings/Navbar.vue")),
			},
			{
				path: "/statusbar",
				name: "statusbar",
				component: page(() => import("./pages/settings/StatusbarPage.vue")),
			},
			{
				path: "/sounds",
				name: "sounds",
				component: page(() => import("./pages/settings/Sounds.vue")),
			},
			{
				path: "/plugin/install",
				name: "plugin",
				component: page(() => import("./pages/settings/PluginInstall.vue")),
			},
			{
				path: "/plugin",
				name: "plugin",
				component: page(() => import("./pages/settings/Plugin.vue")),
			},
			{
				path: "/import-export",
				name: "import-export",
				component: page(() => import("./pages/settings/ImportExport.vue")),
			},
			{
				path: "/instance-mute",
				name: "instance-mute",
				component: page(() => import("./pages/settings/InstanceMute.vue")),
			},
			{
				path: "/mute-block",
				name: "mute-block",
				component: page(() => import("./pages/settings/MuteBlock.vue")),
			},
			{
				path: "/word-mute",
				name: "word-mute",
				component: page(() => import("./pages/settings/WordMute.vue")),
			},
			{
				path: "/api",
				name: "api",
				component: page(() => import("./pages/settings/Api.vue")),
			},
			{
				path: "/apps",
				name: "apps",
				component: page(() => import("./pages/settings/Apps.vue")),
			},
			{
				path: "/webhook/edit/:webhookId",
				name: "webhook",
				component: page(() => import("./pages/settings/WebhookEdit.vue")),
			},
			{
				path: "/webhook/new",
				name: "webhook",
				component: page(() => import("./pages/settings/WebhookNew.vue")),
			},
			{
				path: "/webhook",
				name: "webhook",
				component: page(() => import("./pages/settings/Webhook.vue")),
			},
			{
				path: "/deck",
				name: "deck",
				component: page(() => import("./pages/settings/Deck.vue")),
			},
			{
				path: "/delete-account",
				name: "delete-account",
				component: page(() => import("./pages/settings/DeleteAccount.vue")),
			},
			{
				path: "/preferences-backups",
				name: "preferences-backups",
				component: page(
					() => import("./pages/settings/PreferencesBackups.vue"),
				),
			},
			{
				path: "/migration",
				name: "migration",
				component: page(() => import("./pages/settings/Migration.vue")),
			},
			{
				path: "/custom-css",
				name: "general",
				component: page(() => import("./pages/settings/CustomCss.vue")),
			},
			{
				path: "/custom-katex-macro",
				name: "general",
				component: page(() => import("./pages/settings/CustomKatexMacro.vue")),
			},
			{
				path: "/accounts",
				name: "profile",
				component: page(() => import("./pages/settings/Accounts.vue")),
			},
			{
				path: "/account-info",
				name: "other",
				component: page(() => import("./pages/settings/AccountInfo.vue")),
			},
			{
				path: "/delete-account",
				name: "other",
				component: page(() => import("./pages/settings/DeleteAccount.vue")),
			},
			{
				path: "/other",
				name: "other",
				component: page(() => import("./pages/settings/Other.vue")),
			},
			{
				path: "/",
				component: page(() => import("./pages/Empty.vue")),
			},
		],
	},
	{
		path: "/reset-password/:token?",
		component: page(() => import("./pages/ResetPassword.vue")),
	},
	{
		path: "/signup-complete/:code",
		component: page(() => import("./pages/SignupComplete.vue")),
	},
	{
		path: "/verify-email/:code",
		component: page(() => import("./pages/VerifyEmail.vue")),
	},
	{
		path: "/announcements",
		component: page(() => import("./pages/Announcements.vue")),
	},
	{
		path: "/about",
		component: page(() => import("./pages/About.vue")),
		hash: "initialTab",
	},
	{
		path: "/about-iceshrimp",
		component: page(() => import("./pages/AboutIceshrimp.vue")),
	},
	{
		path: "/theme-editor",
		component: page(() => import("./pages/ThemeEditor.vue")),
		loginRequired: true,
	},
	{
		path: "/explore/tags/:tag",
		component: page(() => import("./pages/Explore.vue")),
	},
	{
		path: "/explore",
		component: page(() => import("./pages/Explore.vue")),
	},
	{
		path: "/search",
		component: page(() => import("./pages/Search.vue")),
		query: {
			q: "query",
			channel: "channel",
		},
	},
	{
		path: "/authorize-follow",
		component: page(() => import("./pages/Follow.vue")),
		loginRequired: true,
	},
	{
		path: "/share",
		component: page(() => import("./pages/Share.vue")),
		loginRequired: true,
	},
	{
		path: "/api-console",
		component: page(() => import("./pages/ApiConsole.vue")),
		loginRequired: true,
	},
	{
		path: "/mfm-cheat-sheet",
		component: page(() => import("./pages/MfmCheatsheet.vue")),
	},
	{
		path: "/scratchpad",
		component: page(() => import("./pages/Scratchpad.vue")),
	},
	{
		path: "/preview",
		component: page(() => import("./pages/Preview.vue")),
	},
	{
		path: "/auth/:token",
		component: page(() => import("./pages/Auth.vue")),
	},
	{
		path: "/oauth/authorize",
		component: page(() => import("./pages/OAuth.vue")),
		query: {
			response_type: "response_type",
			client_id: "client_id",
			redirect_uri: "redirect_uri",
			scope: "scope",
			force_login: "force_login",
			lang: "lang",
		},
	},
	{
		path: "/miauth/:session",
		component: page(() => import("./pages/MiAuth.vue")),
		query: {
			callback: "callback",
			name: "name",
			icon: "icon",
			permission: "permission",
		},
	},
	{
		path: "/tags/:tag",
		component: page(() => import("./pages/Tag.vue")),
	},
	{
		path: "/pages/new",
		component: page(() => import("./pages/page-editor/PageEditor.vue")),
		loginRequired: true,
	},
	{
		path: "/pages/edit/:initPageId",
		component: page(() => import("./pages/page-editor/PageEditor.vue")),
		loginRequired: true,
	},
	{
		path: "/pages",
		component: page(() => import("./pages/Pages.vue")),
	},
	{
		path: "/gallery/:postId/edit",
		component: page(() => import("./pages/gallery/Edit.vue")),
		loginRequired: true,
	},
	{
		path: "/gallery/new",
		component: page(() => import("./pages/gallery/Edit.vue")),
		loginRequired: true,
	},
	{
		path: "/gallery/:postId",
		component: page(() => import("./pages/gallery/Post.vue")),
	},
	{
		path: "/gallery",
		component: page(() => import("./pages/gallery/Index.vue")),
	},
	{
		path: "/channels/:channelId/edit",
		component: page(() => import("./pages/ChannelEditor.vue")),
		loginRequired: true,
	},
	{
		path: "/channels/new",
		component: page(() => import("./pages/ChannelEditor.vue")),
		loginRequired: true,
	},
	{
		path: "/channels/:channelId",
		component: page(() => import("./pages/Channel.vue")),
	},
	{
		path: "/channels",
		component: page(() => import("./pages/Channels.vue")),
	},
	{
		path: "/registry/keys/system/:path(*)?",
		component: page(() => import("./pages/RegistryKeys.vue")),
	},
	{
		path: "/registry/value/system/:path(*)?",
		component: page(() => import("./pages/RegistryValue.vue")),
	},
	{
		path: "/registry",
		component: page(() => import("./pages/Registry.vue")),
	},
	{
		path: "/admin/file/:fileId",
		component: iAmModerator
			? page(() => import("./pages/AdminFile.vue"))
			: page(() => import("./pages/NotFound.vue")),
	},
	{
		path: "/admin",
		component: iAmModerator
			? page(() => import("./pages/admin/Index.vue"))
			: page(() => import("./pages/NotFound.vue")),
		children: [
			{
				path: "/overview",
				name: "overview",
				component: page(() => import("./pages/admin/Overview.vue")),
			},
			{
				path: "/users",
				name: "users",
				component: page(() => import("./pages/admin/Users.vue")),
			},
			{
				path: "/hashtags",
				name: "hashtags",
				component: page(() => import("./pages/admin/Hashtags.vue")),
			},
			{
				path: "/emojis",
				name: "emojis",
				component: page(() => import("./pages/admin/Emojis.vue")),
			},
			{
				path: "/federation",
				name: "federation",
				component: page(() => import("./pages/admin/Federation.vue")),
			},
			{
				path: "/queue",
				name: "queue",
				component: page(() => import("./pages/admin/Queue.vue")),
			},
			{
				path: "/files",
				name: "files",
				component: page(() => import("./pages/admin/Files.vue")),
			},
			{
				path: "/announcements",
				name: "announcements",
				component: page(() => import("./pages/admin/Announcements.vue")),
			},
			{
				path: "/database",
				name: "database",
				component: page(() => import("./pages/admin/Database.vue")),
			},
			{
				path: "/abuses",
				name: "abuses",
				component: page(() => import("./pages/admin/Abuses.vue")),
			},
			{
				path: "/settings",
				name: "settings",
				component: page(() => import("./pages/admin/Settings.vue")),
			},
			{
				path: "/email-settings",
				name: "email-settings",
				component: page(() => import("./pages/admin/EmailSettings.vue")),
			},
			{
				path: "/object-storage",
				name: "object-storage",
				component: page(() => import("./pages/admin/ObjectStorage.vue")),
			},
			{
				path: "/security",
				name: "security",
				component: page(() => import("./pages/admin/Security.vue")),
			},
			{
				path: "/relays",
				name: "relays",
				component: page(() => import("./pages/admin/Relays.vue")),
			},
			{
				path: "/integrations",
				name: "integrations",
				component: page(() => import("./pages/admin/Integrations.vue")),
			},
			{
				path: "/instance-block",
				name: "instance-block",
				component: page(() => import("./pages/admin/InstanceBlock.vue")),
			},
			{
				path: "/other-settings",
				name: "other-settings",
				component: page(() => import("./pages/admin/OtherSettings.vue")),
			},
			{
				path: "/other-settings",
				name: "other-settings",
				component: page(() => import("./pages/admin/CustomCss.vue")),
			},
			{
				path: "/experiments",
				name: "experiments",
				component: page(() => import("./pages/admin/Experiments.vue")),
			},
			{
				path: "/",
				component: page(() => import("./pages/Empty.vue")),
			},
		],
	},
	{
		path: "/my/notifications",
		component: page(() => import("./pages/Notifications.vue")),
		loginRequired: true,
	},
	{
		path: "/my/favorites",
		component: page(() => import("./pages/Favorites.vue")),
		loginRequired: true,
	},
	{
		name: "messaging",
		path: "/my/messaging",
		component: page(() => import("./pages/messaging/Index.vue")),
		loginRequired: true,
	},
	{
		path: "/my/messaging/:userAcct",
		component: page(() => import("./pages/messaging/MessagingRoom.vue")),
		loginRequired: true,
	},
	{
		path: "/my/messaging/group/:groupId",
		component: page(() => import("./pages/messaging/MessagingRoom.vue")),
		loginRequired: true,
	},
	{
		path: "/my/drive/folder/:folder",
		component: page(() => import("./pages/Drive.vue")),
		loginRequired: true,
	},
	{
		path: "/my/drive",
		component: page(() => import("./pages/Drive.vue")),
		loginRequired: true,
	},
	{
		path: "/my/follow-requests",
		component: page(() => import("./pages/FollowRequests.vue")),
		loginRequired: true,
	},
	{
		path: "/my/lists/:listId",
		component: page(() => import("./pages/my-lists/List.vue")),
		loginRequired: true,
	},
	{
		path: "/my/lists",
		component: page(() => import("./pages/my-lists/Index.vue")),
		loginRequired: true,
	},
	{
		path: "/my/clips",
		component: page(() => import("./pages/my-clips/Index.vue")),
		loginRequired: true,
	},
	{
		path: "/my/groups",
		component: page(() => import("./pages/my-groups/Index.vue")),
		loginRequired: true,
	},
	{
		path: "/my/groups/:groupId",
		component: page(() => import("./pages/my-groups/Group.vue")),
		loginRequired: true,
	},
	{
		path: "/my/antennas/create",
		component: page(() => import("./pages/my-antennas/Create.vue")),
		loginRequired: true,
	},
	{
		path: "/my/antennas/:antennaId",
		component: page(() => import("./pages/my-antennas/Edit.vue")),
		loginRequired: true,
	},
	{
		path: "/my/antennas",
		component: page(() => import("./pages/my-antennas/Index.vue")),
		loginRequired: true,
	},
	{
		path: "/timeline/list/:listId",
		component: page(() => import("./pages/UserListTimeline.vue")),
		loginRequired: true,
	},
	{
		path: "/timeline/antenna/:antennaId",
		component: page(() => import("./pages/AntennaTimeline.vue")),
		loginRequired: true,
	},
	{
		name: "index",
		path: "/",
		component: $i
			? page(() => import("./pages/Timeline.vue"))
			: page(() => import("./pages/Welcome.vue")),
		globalCacheKey: "index",
	},
	{
		path: "/:(*)",
		component: page(() => import("./pages/NotFound.vue")),
	},
];

export const mainRouter = new Router(
	routes,
	location.pathname + location.search + location.hash,
);

window.history.replaceState(
	{ key: mainRouter.getCurrentKey() },
	"",
	location.href,
);

// TODO: このファイルでスクロール位置も管理する設計だとdeckに対応できないのでなんとかする
// スクロール位置取得+スクロール位置設定関数をprovideする感じでも良いかも

const scrollPosStore = new Map<string, number>();

window.setInterval(() => {
	scrollPosStore.set(window.history.state?.key, window.scrollY);
}, 1000);

mainRouter.addListener("push", (ctx) => {
	window.history.pushState({ key: ctx.key }, "", ctx.path);
	const scrollPos = scrollPosStore.get(ctx.key) ?? 0;
	window.scroll({ top: scrollPos, behavior: "instant" });
	if (scrollPos !== 0) {
		window.setTimeout(() => {
			// 遷移直後はタイミングによってはコンポーネントが復元し切ってない可能性も考えられるため少し時間を空けて再度スクロール
			window.scroll({ top: scrollPos, behavior: "instant" });
		}, 100);
	}
});

mainRouter.addListener("replace", (ctx) => {
	window.history.replaceState({ key: ctx.key }, "", ctx.path);
});

mainRouter.addListener("same", () => {
	window.scroll({ top: 0, behavior: "smooth" });
});

window.addEventListener("popstate", (event) => {
	mainRouter.replace(
		location.pathname + location.search + location.hash,
		event.state?.key,
		false,
	);
	const scrollPos = scrollPosStore.get(event.state?.key) ?? 0;
	window.scroll({ top: scrollPos, behavior: "instant" });
	window.setTimeout(() => {
		// 遷移直後はタイミングによってはコンポーネントが復元し切ってない可能性も考えられるため少し時間を空けて再度スクロール
		window.scroll({ top: scrollPos, behavior: "instant" });
	}, 100);
});

export function useRouter(): Router {
	return inject<Router | null>("router", null) ?? mainRouter;
}
