const { join } = require("node:path");
const fs = require("node:fs");
const exec = require("execa");

(async () => {
	const file = join(__dirname, "../package.json");
	const json = require(file);

	const match = json['version'].match(/^[\d.]*(?:-pre\d+|)?/);
	const version = match ? `${match[0]}-dev` : "dev";
	const revision = process.argv.length > 2
		? process.argv[2]
		: (await exec("git", ["rev-parse", "--short", "HEAD"])).stdout;

	json['version'] = `${version}-${revision}`;
	console.log(json['version']);
	fs.writeFileSync(file, JSON.stringify(json, null, '\t'));
})();
