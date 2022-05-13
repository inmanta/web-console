import { Pagination, Resource } from "@/Core/Domain";

export interface Query {
  kind: "GetResourcesV2";
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
