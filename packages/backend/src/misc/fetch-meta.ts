import { db } from "@/db/postgre.js";
import { Meta } from "@/models/entities/meta.js";
import push from 'web-push';
import { Metas } from "@/models/index.js";

let cache: Meta;

export function metaToPugArgs(meta: Meta): object {
	let motd = ["Loading..."];
	if (meta.customMOTD.length > 0) {
		motd = meta.customMOTD;
	}
	let splashIconUrl = meta.iconUrl;
	if (meta.customSplashIcons.length > 0) {
		splashIconUrl =
			meta.customSplashIcons[
				Math.floor(Math.random() * meta.customSplashIcons.length)
			];
	}

	return {
		img: meta.bannerUrl,
		title: meta.name || "Iceshrimp",
		instanceName: meta.name || "Iceshrimp",
		desc: meta.description,
		icon: meta.iconUrl,
		splashIcon: splashIconUrl,
		themeColor: meta.themeColor,
		randomMOTD: motd[Math.floor(Math.random() * motd.length)],
		privateMode: meta.privateMode,
	};
}

export async function fetchMeta(noCache = false): Promise<Meta> {
	if (!noCache && cache) return cache;

	// New IDs are prioritized because multiple records may have been created due to past bugs.
	const meta = await Metas.findOne({
		where: {},
		order: {
			id: "DESC",
		},
	});

	if (meta) {
		cache = meta;
		return meta;
	}

	const { publicKey, privateKey } = push.generateVAPIDKeys();
	const data = {
		id: "x",
		swPublicKey: publicKey,
		swPrivateKey: privateKey,
	};

	// If fetchMeta is called at the same time when meta is empty, this part may be called at the same time, so use fail-safe upsert.
	await Metas.upsert(data, ["id"]);

	cache = await Metas.findOneByOrFail({ id: data.id });
	return cache;
}

setInterval(() => {
	fetchMeta(true).then((meta) => {
		cache = meta;
	});
}, 1000 * 10);
