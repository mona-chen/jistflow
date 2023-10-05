import OAuth from "@/server/api/mastodon/entities/oauth/oauth.js";
import { secureRndstr } from "@/misc/secure-rndstr.js";
import { AccessTokens, Apps, AuthSessions } from "@/models/index.js";
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

    public static async getAuthToken(appSecret: string, token: string) {
        // Lookup app
        const app = await Apps.findOneBy({
            secret: appSecret,
        });

        if (app == null) throw new Error("No such app");

        // Fetch token
        const session = await AuthSessions.findOneBy({
            token: token,
            appId: app.id,
        });

        if (session == null) throw new Error("No such session");
        if (session.userId == null) throw new Error("This session is still pending");

        // Lookup access token
        const accessToken = await AccessTokens.findOneByOrFail({
            appId: app.id,
            userId: session.userId,
        });

        // Delete session
        AuthSessions.delete(session.id);

        return accessToken.token;
    }
}
