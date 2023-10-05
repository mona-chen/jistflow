import { PopulatedEmoji } from "@/misc/populate-emojis.js";

export class EmojiConverter {
    public static encode(e: PopulatedEmoji) {
        return {
            shortcode: e.name,
            static_url: e.url,
            url: e.url,
            visible_in_picker: true,
            category: null
        };
    }
}
