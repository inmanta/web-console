import { Pagination, PageSize, Sort } from "@/Core/Domain";
import { ResourceHistory } from "./ResourceHistory";

export interface Query {
  kind: "GetResourceHistory";
  id: string;
  sort?: Sort.Type;
  pageSize: PageSize.Type;
}

export interface Manifest {
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
  query: Query;
}
