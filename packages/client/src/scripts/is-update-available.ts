import { version } from "@/config.js";
import * as os from "@/os.js";

type LatestVersionResponse = {
    tag_name?: string;
};

export async function isUpdateAvailable(): Promise<boolean> {
    if (version.includes('-dev-')) return false;

    return os.api("latest-version").then((res: LatestVersionResponse) => {
        if (!res?.tag_name) return false;
        const tag = res.tag_name as string;
        return (version.includes('-pre') && !tag.includes('-pre')) || tag > `v${version}`;
    });
}
