import type * as firefish from "firefish-js";

export interface Muted {
	muted: boolean;
	matched: string[];
	what?: string; // "note" || "reply" || "renote" || "quote"
}

const NotMuted = { muted: false, matched: [] };

function checkLangMute(
	note: firefish.entities.Note,
	mutedLangs: Array<string | string[]>,
): Muted {
	const mutedLangList = new Set(
		mutedLangs.reduce((arr, x) => [...arr, ...(Array.isArray(x) ? x : [x])]),
	);
	if (mutedLangList.has((note.lang?.[0]?.lang || "").split("-")[0])) {
		return { muted: true, matched: [note.lang?.[0]?.lang] };
	}
	return NotMuted;
}

function checkWordMute(
	note: firefish.entities.Note,
	mutedWords: Array<string | string[]>,
): Muted {
	let text = `${note.cw ?? ""} ${note.text ?? ""}`;
	if (note.files != null)
		text += ` ${note.files.map((f) => f.comment ?? "").join(" ")}`;
	text = text.trim();

	if (text === "") return NotMuted;

	const result = { muted: false, matched: [] };

	for (const mutePattern of mutedWords) {
		if (Array.isArray(mutePattern)) {
			// Clean up
			const keywords = mutePattern.filter((keyword) => keyword !== "");

			if (
				keywords.length > 0 &&
				keywords.every((keyword) =>
					text.toLowerCase().includes(keyword.toLowerCase()),
				)
			) {
				result.muted = true;
				result.matched.push(...keywords);
			}
		} else {
			// represents RegExp
			const regexp = mutePattern.match(/^\/(.+)\/(.*)$/);

			// This should never happen due to input sanitisation.
			if (!regexp) {
				console.warn(`Found invalid regex in word mutes: ${mutePattern}`);
				continue;
			}

			try {
				if (new RegExp(regexp[1], regexp[2]).test(text)) {
					result.muted = true;
					result.matched.push(mutePattern);
				}
			} catch (err) {
				// This should never happen due to input sanitisation.
			}
		}
	}

	result.matched = [...new Set(result.matched)];
	return result;
}

export function getWordSoftMute(
	note: firefish.entities.Note,
	meId: string | null | undefined,
	mutedWords: Array<string | string[]>,
	mutedLangs: Array<string | string[]>,
): Muted {
	if (note.userId === meId) return NotMuted;

	if (mutedWords.length > 0) {
		const noteMuted = checkWordMute(note, mutedWords);
		if (noteMuted.muted) {
			noteMuted.what = "note";
			return noteMuted;
		}

		if (note.renote) {
			const renoteMuted = checkWordMute(note.renote, mutedWords);
			if (renoteMuted.muted) {
				renoteMuted.what = note.text == null ? "renote" : "quote";
				return renoteMuted;
			}
		}

		if (note.reply) {
			const replyMuted = checkWordMute(note.reply, mutedWords);
			if (replyMuted.muted) {
				replyMuted.what = "reply";
				return replyMuted;
			}
		}
	}
	if (mutedLangs.length > 0) {
		let noteLangMuted = checkLangMute(note, mutedLangs);
		if (noteLangMuted.muted) {
			noteLangMuted.what = "note";
			return noteLangMuted;
		}

		if (note.renote) {
			let renoteLangMuted = checkLangMute(note, mutedLangs);
			if (renoteLangMuted.muted) {
				renoteLangMuted.what = note.text == null ? "renote" : "quote";
				return renoteLangMuted;
			}
		}

		if (note.reply) {
			let replyLangMuted = checkLangMute(note, mutedLangs);
			if (replyLangMuted.muted) {
				replyLangMuted.what = "reply";
				return replyLangMuted;
			}
		}
	}

	return NotMuted;
}
