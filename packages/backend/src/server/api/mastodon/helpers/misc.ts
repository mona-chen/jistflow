import config from "@/config/index.js";
import { FILE_TYPE_BROWSERSAFE, MAX_NOTE_TEXT_LENGTH } from "@/const.js";
import { fetchMeta } from "@/misc/fetch-meta.js";
import { Instances, Notes, Users } from "@/models/index.js";
import { IsNull } from "typeorm";
import { awaitAll } from "@/prelude/await-all.js";
import { UserConverter } from "@/server/api/mastodon/converters/user.js";
import { convertAccount } from "@/server/api/mastodon/converters.js";

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
            .then(p => p ? convertAccount(p) : null);
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
}