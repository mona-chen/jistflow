import { defaultStore } from "@/store";

export const twemojiSvgBase = defaultStore.state.useEmojiCdn
	? "https://cdn.jsdelivr.net/gh/discord/twemoji@latest/assets/svg"
	: "/twemoji";

export function char2fileName(char: string): string {
	let codes = Array.from(char).map((x) => x.codePointAt(0)?.toString(16));
	if (!codes.includes("200d")) codes = codes.filter((x) => x !== "fe0f");
	codes = codes.filter((x) => x?.length);
	return codes.join("-");
}

export function char2filePath(char: string): string {
	return `${twemojiSvgBase}/${char2fileName(char)}.svg`;
}
