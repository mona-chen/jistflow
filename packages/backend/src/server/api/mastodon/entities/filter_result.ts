namespace MastodonEntity {
    export type FilterResult = {
        filter: Filter;
        keyword_matches?: string[];
        status_matches?: string[];
    };
}
