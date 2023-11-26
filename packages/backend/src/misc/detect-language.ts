import * as mfm from "mfm-js";
import { detect } from "tinyld";

export default function detectLanguage(text: string): string {
	const nodes = mfm.parse(text);
	const filtered = mfm.extract(nodes, (node) => {
		return node.type === "text" || node.type === "quote";
	});
	const purified = mfm.toString(filtered);
	return detect(purified);
}
