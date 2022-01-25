import { Pagination, ResourceHistory, PageSize, Sort } from "@/Core/Domain";
import { WithId } from "@/Core/Language";

export interface GetResourceHistory extends WithId {
  kind: "GetResourceHistory";
  sort?: Sort.Type;
  pageSize: PageSize.Type;
}

export interface GetResourceHistoryManifest {
  error: string;
  apiResponse: {
    data: ResourceHistory[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  data: {
    data: ResourceHistory[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  usedData: {
    data: ResourceHistory[];
    handlers: Pagination.Handlers;
    metadata: Pagination.Metadata;
  };
  query: GetResourceHistory;
}
