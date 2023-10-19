import { MastodonStreamingConnection } from ".";

export abstract class MastodonStream {
    protected connection: MastodonStreamingConnection;
    public readonly chName: string;
    public static readonly shouldShare: boolean;
    public static readonly requireCredential: boolean;
    public static readonly requiredScopes: string[] = [];

    protected get user() {
        return this.connection.user;
    }

    protected get userProfile() {
        return this.connection.userProfile;
    }

    protected get following() {
        return this.connection.following;
    }

    protected get muting() {
        return this.connection.muting;
    }

    protected get renoteMuting() {
        return this.connection.renoteMuting;
    }

    protected get blocking() {
        return this.connection.blocking;
    }

    protected get hidden() {
        return this.connection.hidden;
    }

    protected get subscriber() {
        return this.connection.subscriber;
    }

    protected constructor(connection: MastodonStreamingConnection, name: string) {
        this.chName = name;
        this.connection = connection;
    }

    public abstract init(params: any): void;

    public dispose?(): void;

    public onMessage?(type: string, body: any): void;
}
