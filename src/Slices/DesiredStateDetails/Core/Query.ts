import { Pagination, PageSize, Sort, Resource } from "@/Core/Domain";
import { CurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";

export interface Query {
  kind: "GetVersionResources";
  version: string;
  filter?: Resource.FilterFromVersion;
  sort?: Sort.Type<Resource.SortKeyFromVersion>;
  pageSize: PageSize.Type;
  currentPage: CurrentPage;
}

export interface Manifest {
  error: string;
  apiResponse: Resource.ResponseFromVersion;
  data: Resource.ResponseFromVersion;
  usedData: {
    data: Resource.FromVersion[];
    handlers: Pagination.Handlers;
    metadata: Pagination.Metadata;
  };
  query: Query;
}
