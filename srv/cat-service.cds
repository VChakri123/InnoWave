using my.cricket as my from '../db/schema';

service CatalogService {
    entity Cricket as projection on my.Cricket;
    entity Wickets as projection on my.Wickets;
}
