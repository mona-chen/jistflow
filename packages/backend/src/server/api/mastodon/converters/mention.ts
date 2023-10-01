import { User } from "@/models/entities/user.js";
import config from "@/config/index.js";
import { IMentionedRemoteUsers } from "@/models/entities/note.js";

export class MentionConverter {
    public static encode(u: User, m: IMentionedRemoteUsers): MastodonEntity.Mention {
        let acct = u.username;
        let acctUrl = `https://${u.host || config.host}/@${u.username}`;
        let url: string | null = null;
        if (u.host) {
            const info = m.find(r => r.username === u.username && r.host === u.host);
            acct = `${u.username}@${u.host}`;
            acctUrl = `https://${u.host}/@${u.username}`;
            if (info) url = info.url ?? info.uri;
        }
        return {
            id: u.id,
            username: u.username,
            acct: acct,
            url: url ?? acctUrl,
        };
    }
}
