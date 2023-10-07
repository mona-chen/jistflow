import { MastoContext } from "@/server/api/mastodon/index.js";

const headers = {
    "Access-Control-Expose-Headers": "Link,Connection,Sec-Websocket-Accept,Upgrade"
};

export async function SetHeadersMiddleware(ctx: MastoContext, next: () => Promise<any>) {
    ctx.set(headers);
    await next();
}
