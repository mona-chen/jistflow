import * as fs from "node:fs";
import * as Path from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import config from "@/config/index.js";

export class InternalStorage {
	public static resolvePath = (key: string) =>
		Path.resolve(config.mediaDir, key);

	public static read(key: string) {
		return fs.createReadStream(InternalStorage.resolvePath(key));
	}

	public static saveFromPath(key: string, srcPath: string) {
		fs.mkdirSync(config.mediaDir, { recursive: true });
		fs.copyFileSync(srcPath, InternalStorage.resolvePath(key));
		return `${config.url}/files/${key}`;
	}

	public static saveFromBuffer(key: string, data: Buffer) {
		fs.mkdirSync(config.mediaDir, { recursive: true });
		fs.writeFileSync(InternalStorage.resolvePath(key), data);
		return `${config.url}/files/${key}`;
	}

	public static del(key: string) {
		fs.unlink(InternalStorage.resolvePath(key), () => {});
	}
}
