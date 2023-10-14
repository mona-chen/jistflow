import { Announcement } from "@/models/entities/announcement.js";
import { MfmHelpers } from "@/server/api/mastodon/helpers/mfm.js";
import mfm from "mfm-js";

export class AnnouncementConverter {
    public static async encode(announcement: Announcement, isRead: boolean): Promise<MastodonEntity.Announcement> {
        return {
            id: announcement.id,
            content: `<h1>${await MfmHelpers.toHtml(mfm.parse(announcement.title), [], null) ?? 'Announcement'}</h1>${await MfmHelpers.toHtml(mfm.parse(announcement.text), [], null) ?? ''}`,
            starts_at: null,
            ends_at: null,
            published: true,
            all_day: false,
            published_at: announcement.createdAt.toISOString(),
            updated_at: announcement.updatedAt?.toISOString() ?? announcement.createdAt.toISOString(),
            read: isRead,
            mentions: [], //FIXME
            statuses: [],
            tags: [],
            emojis: [], //FIXME
            reactions: [],
        };
    }
}
