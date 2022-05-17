import { Pagination, Resource } from "@/Core/Domain";
import { PageSize } from "@/Core/Domain/PageSize";
import { Sort } from "@/Core/Domain/Sort";

export type SortKeyV2 = "status" | "resource_type";

export interface Query {
  kind: "GetResourcesV2";
  pageSize: PageSize;
  sort?: Sort<SortKeyV2>;
}

export interface Manifest {
  error: string;
  apiResponse: {
    data: Raw[];
    links: Pagination.Links;
    metadata: Resource.Metadata;
  };
  data: {
    data: Resource.Resource[];
    links: Pagination.Links;
    metadata: Resource.Metadata;
  };
  usedData: {
    data: Resource.Resource[];
    handlers: Pagination.Handlers;
    metadata: Resource.Metadata;
  };
  query: Query;
}

export interface Raw {
  resource_id: string;
  requires: string[];
  status: string;
  id_details: Resource.IdDetails;
}
