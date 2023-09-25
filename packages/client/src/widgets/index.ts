import { App, defineAsyncComponent } from "vue";

export default function (app: App) {
	app.component(
		"wMemo",
		defineAsyncComponent(() => import("./Memo.vue")),
	);
	app.component(
		"wNotifications",
		defineAsyncComponent(() => import("./Notifications.vue")),
	);
	app.component(
		"wTimeline",
		defineAsyncComponent(() => import("./Timeline.vue")),
	);
	app.component(
		"wCalendar",
		defineAsyncComponent(() => import("./Calendar.vue")),
	);
	app.component(
		"wRss",
		defineAsyncComponent(() => import("./Rss.vue")),
	);
	app.component(
		"wRssTicker",
		defineAsyncComponent(() => import("./RssTicker.vue")),
	);
	app.component(
		"wTrends",
		defineAsyncComponent(() => import("./Trends.vue")),
	);
	app.component(
		"wClock",
		defineAsyncComponent(() => import("./Clock.vue")),
	);
	app.component(
		"wActivity",
		defineAsyncComponent(() => import("./Activity.vue")),
	);
	app.component(
		"wPhotos",
		defineAsyncComponent(() => import("./Photos.vue")),
	);
	app.component(
		"wDigitalClock",
		defineAsyncComponent(() => import("./DigitalClock.vue")),
	);
	app.component(
		"wUnixClock",
		defineAsyncComponent(() => import("./UnixClock.vue")),
	);
	app.component(
		"wFederation",
		defineAsyncComponent(() => import("./Federation.vue")),
	);
	app.component(
		"wPostForm",
		defineAsyncComponent(() => import("./PostForm.vue")),
	);
	app.component(
		"wSlideshow",
		defineAsyncComponent(() => import("./Slideshow.vue")),
	);
	app.component(
		"wServerMetric",
		defineAsyncComponent(() => import("./server-metric/Index.vue")),
	);
	app.component(
		"wOnlineUsers",
		defineAsyncComponent(() => import("./OnlineUsers.vue")),
	);
	app.component(
		"wJobQueue",
		defineAsyncComponent(() => import("./JobQueue.vue")),
	);
	app.component(
		"wInstanceCloud",
		defineAsyncComponent(() => import("./InstanceCloud.vue")),
	);
	app.component(
		"wButton",
		defineAsyncComponent(() => import("./Button.vue")),
	);
	app.component(
		"wAiscript",
		defineAsyncComponent(() => import("./Aiscript.vue")),
	);
	app.component(
		"wUserList",
		defineAsyncComponent(() => import("./UserList.vue")),
	);
	app.component(
		"wServerInfo",
		defineAsyncComponent(() => import("./ServerInfo.vue")),
	);
}

export const widgets = [
	"memo",
	"notifications",
	"timeline",
	"calendar",
	"userList",
	"rss",
	"rssTicker",
	"trends",
	"clock",
	"activity",
	"photos",
	"digitalClock",
	"unixClock",
	"federation",
	"instanceCloud",
	"postForm",
	"slideshow",
	"serverMetric",
	"serverInfo",
	"onlineUsers",
	"jobQueue",
	"button",
	"aiscript",
];
