import type { Account } from "@/account";
import { reactive } from "vue";

const accountData = localStorage.getItem("account");

// TODO: 外部からはreadonlyに
export const $i = accountData
	? reactive(JSON.parse(accountData) as Account)
	: null;
