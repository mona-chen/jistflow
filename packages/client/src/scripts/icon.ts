import { defaultStore } from "@/store";

export default function icon(name: string, large = true): string {
	return `${name} ${large ? "ph-lg" : ""} ${defaultStore.state.iconSet}`;
}
