import * as crypto from "node:crypto";

const charset = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function secureRndstr(length = 32): string {
	let str = "";

	for (let i = 0; i < length; i++) {
		let rand = Math.floor(
			(crypto.randomBytes(1).readUInt8(0) / 0xff) * charset.length,
		);
		if (rand === charset.length) {
			rand = charset.length - 1;
		}
		str += charset.charAt(rand);
	}

	return str;
}
