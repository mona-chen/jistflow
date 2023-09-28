import OAuth from "@/server/api/mastodon/entities/oauth/oauth.js";
import { secureRndstr } from "@/misc/secure-rndstr.js";
import { Apps, AuthSessions } from "@/models/index.js";
import { genId } from "@/misc/gen-id.js";
import { v4 as uuid } from "uuid";
import config from "@/config/index.js";

export class AuthHelpers {
    public static async registerApp(name: string, scopes: string[], redirect_uris: string, website: string | null): Promise<OAuth.AppData> {
        const secret = secureRndstr(32);
        const app = await Apps.insert({
            id: genId(),
            createdAt: new Date(),
            userId: null,
            name: name,
            description: '',
            permission: scopes,
            callbackUrl: redirect_uris,
            secret: secret,
        }).then((x) => Apps.findOneByOrFail(x.identifiers[0]));

        const appdataPre: OAuth.AppDataFromServer = {
            id: app.id,
            name: app.name,
            website: website,
            client_id: "",
            client_secret: app.secret,
            redirect_uri: redirect_uris!
        }
        const appdata = OAuth.AppData.from(appdataPre);
        const token = uuid();
        const session = await AuthSessions.insert({
            id: genId(),
            createdAt: new Date(),
            appId: app.id,
            token: token,
        }).then((x) => AuthSessions.findOneByOrFail(x.identifiers[0]));

        appdata.url = `${config.authUrl}/${session.token}`;
        appdata.session_token = session.token;
        return appdata;
    }
}
