const { globSync } = require('glob');
const { join } = require("node:path");
const fs = require("node:fs");
const exec = require("execa");

const files = globSync('**/package.json');

for (const file of files) {
	const json = require(join('../', file));
	json['devDependencies'] = undefined;
	fs.writeFileSync(file, JSON.stringify(json, null, '\t'));
}

exec("yarn", ["install"], {
	stdout: process.stdout,
	stderr: process.stderr,
});
