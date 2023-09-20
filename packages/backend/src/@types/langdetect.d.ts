declare module "langdetect" {
	interface DetectResult {
		lang: string;
		prob: number;
	}
	export function detect(words: string): DetectResult[];
}
