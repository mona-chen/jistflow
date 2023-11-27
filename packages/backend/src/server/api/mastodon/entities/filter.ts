namespace MastodonEntity {
    export type Filter = {
        id: string;
        title: string;
        context: Array<FilterContext>;
        expires_at: string | null;
        filter_action: 'warn' | 'hide';
        keywords: FilterKeyword[];
        statuses: FilterStatus[];
    };

    export type FilterContext = 'home' | 'notifications' | 'public' | 'thread' | 'account';
}
