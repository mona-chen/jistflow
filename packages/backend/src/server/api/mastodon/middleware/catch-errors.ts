import { MastoContext, logger } from "@/server/api/mastodon/index.js";
import { IdentifiableError } from "@/misc/identifiable-error.js";
import { ApiError } from "@/server/api/error.js";

export class MastoApiError extends Error {
    statusCode: number;
    constructor(statusCode: number, message?: string) {
        if (message == null) {
            switch (statusCode) {
                case 404:
                    message = 'Record not found';
                    break;
                default:
                    message = 'Unknown error occurred';
                    break;
            }
        }
        super(message);
        this.statusCode = statusCode;
    }
}

export async function CatchErrorsMiddleware(ctx: MastoContext, next: () => Promise<any>) {
    try {
        await next();
    } catch (e: any) {
        if (e instanceof MastoApiError) {
            ctx.status = e.statusCode;
        }
        else if (e instanceof IdentifiableError) {
            ctx.status = 400;
        }
        else if (e instanceof ApiError) {
            ctx.status = e.httpStatusCode ?? 500;
        }
        else {
            logger.error(`Error occured in ${ctx.method} ${ctx.path}:`);
            if (e instanceof Error) {
                if (e.stack) logger.error(e.stack);
                else logger.error(`${e.name}: ${e.message}`);
            }
            else {
                logger.error(e);
            }
            ctx.status = 500;
        }
        ctx.body = { error: e.message };
        return;
    }
}