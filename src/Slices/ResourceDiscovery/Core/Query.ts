import { PageSize, Pagination, Sort } from "@/Core/Domain";
import { CurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";

export interface Query {
  kind: "GetDiscoveredResources";
  sort?: Sort.Sort<SortKey>;
  filter?: Filter;
  pageSize: PageSize.PageSize;
  currentPage: CurrentPage;
}

export interface Manifest {
  error: string;
  apiResponse: {
    data: DiscoveredResource[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  data: {
    data: DiscoveredResource[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  usedData: {
    data: DiscoveredResource[];
    handlers: Pagination.Handlers;
    metadata: Pagination.Metadata;
  };
  query: Query;
}

export interface DiscoveredResource {
  discovered_resource_id: string;
  values: unknown;
}

export interface Filter {
  name?: string[];
  discovered_resource_id?: string[];
}

export type SortKey = "discovered_resource_id";
