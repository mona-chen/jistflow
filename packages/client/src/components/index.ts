import { App } from "vue";

import Mfm from "./global/MisskeyFlavoredMarkdown.vue";
import A from "./global/Anchor.vue";
import Acct from "./global/Acct.vue";
import Avatar from "./global/Avatar.vue";
import Emoji from "./global/Emoji.vue";
import UserName from "./global/UserName.vue";
import Ellipsis from "./global/Ellipsis.vue";
import Time from "./global/Time.vue";
import Url from "./global/Url.vue";
import I18n from "./global/i18n";
import RouterView from "./global/RouterView.vue";
import Loading from "./global/Loading.vue";
import Error_ from "./global/Error.vue";
import PageHeader from "./global/PageHeader.vue";
import Spacer from "./global/Spacer.vue";
import StickyContainer from "./global/StickyContainer.vue";

export default function (app: App) {
	app.component("I18n", I18n);
	app.component("RouterView", RouterView);
	app.component("Mfm", Mfm);
	app.component("A", A);
	app.component("Acct", Acct);
	app.component("Avatar", Avatar);
	app.component("Emoji", Emoji);
	app.component("UserName", UserName);
	app.component("Ellipsis", Ellipsis);
	app.component("Time", Time);
	app.component("Url", Url);
	app.component("Loading", Loading);
	app.component("Error_", Error_);
	app.component("PageHeader", PageHeader);
	app.component("Spacer", Spacer);
	app.component("StickyContainer", StickyContainer);
}

declare module "@vue/runtime-core" {
	export interface GlobalComponents {
		I18n: typeof I18n;
		RouterView: typeof RouterView;
		Mfm: typeof Mfm;
		A: typeof A;
		Acct: typeof Acct;
		Avatar: typeof Avatar;
		Emoji: typeof Emoji;
		UserName: typeof UserName;
		Ellipsis: typeof Ellipsis;
		Time: typeof Time;
		Url: typeof Url;
		Loading: typeof Loading;
		Error_: typeof Error_;
		PageHeader: typeof PageHeader;
		Spacer: typeof Spacer;
		StickyContainer: typeof StickyContainer;
	}
}
