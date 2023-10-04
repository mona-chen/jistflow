import config from "@/config/index.js";
import { FILE_TYPE_BROWSERSAFE, MAX_NOTE_TEXT_LENGTH } from "@/const.js";
import { fetchMeta } from "@/misc/fetch-meta.js";
import { AnnouncementReads, Announcements, Instances, Notes, Users } from "@/models/index.js";
import { IsNull } from "typeorm";
import { awaitAll } from "@/prelude/await-all.js";
import { UserConverter } from "@/server/api/mastodon/converters/user.js";
import { convertAccountId } from "@/server/api/mastodon/converters.js";
import { Announcement } from "@/models/entities/announcement.js";
import { ILocalUser } from "@/models/entities/user.js";
import { AnnouncementConverter } from "@/server/api/mastodon/converters/announcement.js";
import { genId } from "@/misc/gen-id.js";

export class MiscHelpers {
    public static async getInstance(): Promise<MastodonEntity.Instance> {
        const userCount = Users.count({where: {host: IsNull()}});
        const noteCount = Notes.count({where: {userHost: IsNull()}});
        const instanceCount = Instances.count({ cache: 3600000 });
        const contact = await Users.findOne({
            where: {
                host: IsNull(),
                isAdmin: true,
                isDeleted: false,
                isSuspended: false,
            },
            order: {id: "ASC"},
        })
            .then(p => p ? UserConverter.encode(p) : null)
            .then(p => p ? convertAccountId(p) : null);
        const meta = await fetchMeta(true);

        const res = {
            uri: config.domain,
            title: meta.name || "Iceshrimp",
            short_description:
                meta.description?.substring(0, 50) || "This is an Iceshrimp instance. It doesn't seem to have a description.",
            description:
                meta.description ||
                "This is an Iceshrimp instance. It doesn't seem to have a description.",
            email: meta.maintainerEmail || "",
            version: `4.1.0 (compatible; Iceshrimp ${config.version})`,
            urls: {
                streaming_api: `${config.url.replace(/^http(?=s?:\/\/)/, "ws")}/streaming`,
            },
            stats: awaitAll({
                user_count: userCount,
                status_count: noteCount,
                domain_count: instanceCount,
            }),
            thumbnail: meta.bannerUrl || "/static-assets/transparent.png",
            languages: meta.langs,
            registrations: !meta.disableRegistration,
            approval_required: meta.disableRegistration,
            invites_enabled: meta.disableRegistration,
            configuration: {
                accounts: {
                    max_featured_tags: 20,
                },
                statuses: {
                    max_characters: MAX_NOTE_TEXT_LENGTH,
                    max_media_attachments: 16,
                    characters_reserved_per_url: 23,
                },
                media_attachments: {
                    supported_mime_types: FILE_TYPE_BROWSERSAFE,
                    image_size_limit: 10485760,
                    image_matrix_limit: 16777216,
                    video_size_limit: 41943040,
                    video_frame_limit: 60,
                    video_matrix_limit: 2304000,
                },
                polls: {
                    max_options: 10,
                    max_characters_per_option: 50,
                    min_expiration: 50,
                    max_expiration: 2629746,
                },
                reactions: {
                    max_reactions: 1,
                },
            },
            contact_account: contact,
            rules: [],
        };

        return awaitAll(res);
    }

    public static async getAnnouncements(user: ILocalUser, includeRead: boolean = false): Promise<MastodonEntity.Announcement[]> {
        if (includeRead) {
            const [announcements, reads] = await Promise.all([
                Announcements.createQueryBuilder("announcement")
                    .orderBy({"announcement.id": "DESC"})
                    .getMany(),
                AnnouncementReads.findBy({userId: user.id})
                    .then(p => p.map(x => x.announcementId))
            ]);

            return announcements.map(p => AnnouncementConverter.encode(p, reads.includes(p.id)));
        }

        const sq = AnnouncementReads.createQueryBuilder("reads")
            .select("reads.announcementId")
            .where("reads.userId = :userId");

        const query = Announcements.createQueryBuilder("announcement")
            .where(`announcement.id NOT IN (${sq.getQuery()})`)
            .orderBy({"announcement.id": "DESC"})
            .setParameter("userId", user.id);

        return query.getMany()
            .then(p => p.map(x => AnnouncementConverter.encode(x, false)));
    }

    public static async dismissAnnouncement(announcement: Announcement, user: ILocalUser): Promise<void> {
        const exists = await AnnouncementReads.exist({where: {userId: user.id, announcementId: announcement.id}});
        if (!exists) {
            await AnnouncementReads.insert({
                id: genId(),
                createdAt: new Date(),
                userId: user.id,
                announcementId: announcement.id
            });
        }
    }
}