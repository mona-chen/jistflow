import { reactive } from "vue";
import type { Account } from "@/account";

const accountData = localStorage.getItem("account");

// TODO: 外部からはreadonlyに
export const $i = accountData
	? reactive(JSON.parse(accountData) as Account)
	: null;

export const isSignedIn = $i != null;
export const isModerator = $i != null && ($i.isModerator || $i.isAdmin);
export const isAdmin = $i != null && $i.isAdmin;
