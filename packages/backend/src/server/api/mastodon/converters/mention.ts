import { User } from "@/models/entities/user.js";
import config from "@/config/index.js";

export class MentionConverter {
	public static encode(u: User): MastodonEntity.Mention {
		let acct = u.username;
		let acctUrl = `https://${u.host || config.host}/@${u.username}`;
		if (u.host) {
			acct = `${u.username}@${u.host}`;
			acctUrl = `https://${u.host}/@${u.username}`;
		}
		return {
			id: u.id,
			username: u.username,
			acct: acct,
			url: u.uri ?? acctUrl,
		};
	}
}
