import * as mfm from "mfm-js";
import type { Note } from "@/models/entities/note.js";
import { toHtml } from "../../../mfm/to-html.js";

export default async function (note: Note) {
	if (!note.text) return "";
	return toHtml(mfm.parse(note.text), JSON.parse(note.mentionedRemoteUsers), note.userHost);
}
