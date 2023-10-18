import { defaultStore } from "@/store";

export default function (name: string, large = true): string {
	return `${name} ${large ? "ph-lg" : ""} ${defaultStore.state.iconSet}`;
}
