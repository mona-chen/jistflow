const { join } = require("node:path");
const fs = require("node:fs");
const exec = require("execa");

(async () => {
	const file = join(__dirname, "../package.json");
	const json = require(file);

	const match = json['version'].match(/^[\d.]*(?:-pre\d+|)?/);
	const version = match ? `${match[0]}-dev` : "dev";
	const { stdout: revision } = await exec("git", ["rev-parse", "--short", "HEAD"]);;

	json['version'] = `${version}-${revision}`;
	console.log(json['version']);
	fs.writeFileSync(file, JSON.stringify(json, null, '\t'));
})();
