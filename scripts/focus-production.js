const { globSync } = require('glob');
const { join } = require("node:path");
const fs = require("node:fs");
const exec = require("execa");
const YAML = require('yaml')

const files = globSync('**/package.json');

for (const file of files) {
	const json = require(join('../', file));
	json['devDependencies'] = undefined;
	fs.writeFileSync(file, JSON.stringify(json, null, '\t'));
}

const file = join('./', '.yarnrc.yml');
const yarnrc = YAML.parse(fs.readFileSync(file, 'utf8'));
yarnrc['supportedArchitectures'] = {
	cpu: ['current'],
	libc: ['current'],
	os: ['current'],
};
fs.writeFileSync(file, YAML.stringify(yarnrc));


exec("yarn", ["install"], {
	stdout: process.stdout,
	stderr: process.stderr,
});
