import { User } from "@/models/entities/user.js";
import config from "@/config/index.js";
import { UserProfiles, Users } from "@/models/index.js";
import { EmojiConverter } from "@/server/api/mastodon/converters/emoji.js";
import { populateEmojis } from "@/misc/populate-emojis.js";
import { toHtml } from "@/mfm/to-html.js";
import { escapeMFM } from "@/server/api/mastodon/converters/mfm.js";
import mfm from "mfm-js";

type Field = {
	name: string;
	value: string;
	verified?: boolean;
};

export async function convertUser(u: User): Promise<MastodonEntity.Account> {
    let acct = u.username;
    let acctUrl = `https://${u.host || config.host}/@${u.username}`;
    if (u.host) {
        acct = `${u.username}@${u.host}`;
        acctUrl = `https://${u.host}/@${u.username}`;
    }
		const profile = await UserProfiles.findOneBy({userId: u.id});
		const bio = toHtml(mfm.parse(profile?.description ?? "")) ?? escapeMFM(profile?.description ?? "");

    return {
        id: u.id,
        username: u.username,
        acct: acct,
        display_name: u.name || u.username,
        locked: u.isLocked,
        created_at: new Date().toISOString(),
        followers_count: u.followersCount,
        following_count: u.followingCount,
        statuses_count: u.notesCount,
        note: bio,
        url: u.uri ?? acctUrl,
        avatar: u.avatar?.url ?? Users.getIdenticonUrl(u.id),
        avatar_static: u.avatar?.url ?? Users.getIdenticonUrl(u.id),
        header: u.banner?.url ?? `${config.url}/static-assets/transparent.png`,
        header_static: u.banner?.url ?? `${config.url}/static-assets/transparent.png`,
        emojis: (await populateEmojis(u.emojis, u.host)).map((e) => EmojiConverter.encode(e)),
        moved: null, //FIXME
        fields: profile?.fields.map(p => convertField(p)) ?? [],
        bot: u.isBot
    };
}

function convertField(f: Field): MastodonEntity.Field {
	return {
		name: f.name,
		value: toHtml(mfm.parse(f.value)) ?? escapeMFM(f.value),
		verified_at: f.verified ? (new Date()).toISOString() : null,
	}
}
