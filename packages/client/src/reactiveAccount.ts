import { reactive } from "vue";
import type { Account } from "@/account";

const accountData = localStorage.getItem("account");

// TODO: 外部からはreadonlyに
export const $i = accountData
	? reactive(JSON.parse(accountData) as Account)
	: null;
