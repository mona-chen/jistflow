import type * as firefish from "firefish-js";
import * as Acct from "firefish-js/built/acct";
import { url } from "@/config";

export const acct = (user: firefish.Acct) => {
	return Acct.toString(user);
};

export const userName = (user: firefish.entities.User) => {
	return user.name || user.username;
};

export const userPage = (user: firefish.Acct, path?, absolute = false) => {
	return `${absolute ? url : ""}/@${acct(user)}${path ? `/${path}` : ""}`;
};
