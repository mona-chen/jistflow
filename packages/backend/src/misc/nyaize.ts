export function nyaize(text: string, lang?: string): string {
	text = text
		// ja-JP
		.replaceAll("な", "にゃ")
		.replaceAll("ナ", "ニャ")
		.replaceAll("ﾅ", "ﾆｬ")
		// en-US
		.replace(/(?<=n)a/gi, (x) => (x === "A" ? "YA" : "ya"))
		.replace(/(?<=morn)ing/gi, (x) => (x === "ING" ? "YAN" : "yan"))
		.replace(/(?<=every)one/gi, (x) => (x === "ONE" ? "NYAN" : "nyan"))
		.replace(/non(?=[bcdfghjklmnpqrstvwxyz])/gi, (x) =>
			x === "NON" ? "NYAN" : "nyan",
		)
		// ko-KR
		.replace(/[나-낳]/g, (match) =>
			String.fromCharCode(
				match.charCodeAt(0)! + "냐".charCodeAt(0) - "나".charCodeAt(0),
			),
		)
		.replace(/(다$)|(다(?=\.))|(다(?= ))|(다(?=!))|(다(?=\?))/gm, "다냥")
		.replace(/(야(?=\?))|(야$)|(야(?= ))/gm, "냥")
		// el-GR
		.replaceAll("να", "νια")
		.replaceAll("ΝΑ", "ΝΙΑ")
		.replaceAll("Να", "Νια");

	// zh-CN, zh-TW
	if (lang === "zh") text = text.replace(/(妙|庙|描|渺|瞄|秒|苗|藐|廟)/g, "喵");

	return text;
}
