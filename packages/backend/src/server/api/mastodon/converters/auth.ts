import { unique } from "@/prelude/array.js";

export class AuthConverter {
    private static readScopes = [
        "read:account",
        "read:drive",
        "read:blocks",
        "read:favorites",
        "read:following",
        "read:messaging",
        "read:mutes",
        "read:notifications",
        "read:reactions",
    ];

    private static writeScopes = [
        "write:account",
        "write:drive",
        "write:blocks",
        "write:favorites",
        "write:following",
        "write:messaging",
        "write:mutes",
        "write:notes",
        "write:notifications",
        "write:reactions",
        "write:votes",
    ];

    private static followScopes = [
        "read:following",
        "read:blocks",
        "read:mutes",
        "write:following",
        "write:blocks",
        "write:mutes",
    ];

    public static decode(scopes: string[]): string[] {
        const res: string[] = [];

        for (const scope of scopes) {
            if (scope === "read")
                res.push(...this.readScopes);
            else if (scope === "write")
                res.push(...this.writeScopes);
            else if (scope === "follow")
                res.push(...this.followScopes);
            else if (scope === "read:accounts")
                res.push("read:account");
            else if (scope === "read:blocks")
                res.push("read:blocks");
            else if (scope === "read:bookmarks")
                res.push("read:favorites");
            else if (scope === "read:favourites")
                res.push("read:reactions");
            else if (scope === "read:filters")
                res.push("read:account")
            else if (scope === "read:follows")
                res.push("read:following");
            else if (scope === "read:lists")
                res.push("read:account");
            else if (scope === "read:mutes")
                res.push("read:mutes");
            else if (scope === "read:notifications")
                res.push("read:notifications");
            else if (scope === "read:search")
                res.push("read:account"); // FIXME: move this to a new scope "read:search"
            else if (scope === "read:statuses")
                res.push("read:messaging");
            else if (scope === "write:accounts")
                res.push("write:account");
            else if (scope === "write:blocks")
                res.push("write:blocks");
            else if (scope === "write:bookmarks")
                res.push("write:favorites");
            else if (scope === "write:favourites")
                res.push("write:reactions");
            else if (scope === "write:filters")
                res.push("write:account");
            else if (scope === "write:follows")
                res.push("write:following");
            else if (scope === "write:lists")
                res.push("write:account");
            else if (scope === "write:media")
                res.push("write:drive");
            else if (scope === "write:mutes")
                res.push("write:mutes");
            else if (scope === "write:notifications")
                res.push("write:notifications");
            else if (scope === "write:reports")
                res.push("read:account"); // FIXME: move this to a new scope "write:reports"
            else if (scope === "write:statuses")
                res.push(...["write:notes", "write:messaging", "write:votes"]);
            else if (scope === "write:conversations")
                res.push("write:messaging");
            // ignored: "push"
        }

        return unique(res);
    }

    public static encode(scopes: string[]): string[] {
        const res: string[] = [];

        for (const scope of scopes) {
            if (scope === "read:account")
                res.push(...["read:accounts", "read:filters", "read:search", "read:lists"]);
            else if (scope === "read:blocks")
                res.push("read:blocks");
            else if (scope === "read:favorites")
                res.push("read:bookmarks");
            else if (scope === "read:reactions")
                res.push("read:favourites");
            else if (scope === "read:following")
                res.push("read:follows");
            else if (scope === "read:mutes")
                res.push("read:mutes");
            else if (scope === "read:notifications")
                res.push("read:notifications");
            else if (scope === "read:messaging")
                res.push("read:statuses");
            else if (scope === "write:account")
                res.push(...["write:accounts", "write:lists", "write:filters", "write:reports"]);
            else if (scope === "write:blocks")
                res.push("write:blocks");
            else if (scope === "write:favorites")
                res.push("write:bookmarks");
            else if (scope === "write:reactions")
                res.push("write:favourites");
            else if (scope === "write:following")
                res.push("write:follows");
            else if (scope === "write:drive")
                res.push("write:media");
            else if (scope === "write:mutes")
                res.push("write:mutes");
            else if (scope === "write:notifications")
                res.push("write:notifications");
            else if (scope === "write:notes")
                res.push("write:statuses");
            else if (scope === "write:messaging")
                res.push("write:conversations");
            else if (scope === "write:votes")
                res.push("write:statuses");
        }

        return unique(res);
    }
}