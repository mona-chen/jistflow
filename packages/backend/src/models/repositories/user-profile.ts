import { db } from "@/db/postgre.js";
import { UserProfile } from "@/models/entities/user-profile.js";
import mfm from "mfm-js";
import { extractMentions } from "@/misc/extract-mentions.js";
import { resolveMentionToUserAndProfile } from "@/remote/resolve-user.js";
import { IMentionedRemoteUsers } from "@/models/entities/note.js";
import { unique } from "@/prelude/array.js";
import config from "@/config/index.js";
import { Mutex, Semaphore } from "async-mutex";

const queue = new Semaphore(5);

export const UserProfileRepository = db.getRepository(UserProfile).extend({
    // We must never await this without promiseEarlyReturn, otherwise giant webring-style profile mention trees will cause the queue to stop working
    async updateMentions(id: UserProfile["userId"], limiter: RecursionLimiter = new RecursionLimiter(20)){
        const profile = await this.findOneBy({ userId: id });
        if (!profile) return;
        const tokens: mfm.MfmNode[] = [];

        if (profile.description)
            tokens.push(...mfm.parse(profile.description));
        if (profile.fields.length > 0)
            tokens.push(...profile.fields.map(p => mfm.parse(p.value).concat(mfm.parse(p.name))).flat());

        return queue.runExclusive(async () => {
            const partial = {
                mentions: await populateMentions(tokens, profile.userHost, limiter)
            };
            return UserProfileRepository.update(profile.userId, partial);
        });
    },
});

async function populateMentions(tokens: mfm.MfmNode[], objectHost: string | null, limiter: RecursionLimiter): Promise<IMentionedRemoteUsers> {
    const mentions = extractMentions(tokens);
    const resolved = await Promise.all(mentions.map(m => resolveMentionToUserAndProfile(m.username, m.host, objectHost, limiter)));
    const remote = resolved.filter(p => p && p.data.host !== config.domain && (p.data.host !== null || objectHost !== null))
        .map(p => p!);
    const res = remote.map(m => {
        return {
            uri: m.user.uri!,
            url: m.profile?.url ?? undefined,
            username: m.data.username,
            host: m.data.host!
        };
    });

    return unique(res);
}

export class RecursionLimiter {
    private counter;
    private mutex = new Mutex();
    constructor(count: number = 20) {
        this.counter = count;
    }

    public shouldContinue(): Promise<boolean> {
        return this.mutex.runExclusive(() => {
            return this.counter-- > 0;
        });
    }
}