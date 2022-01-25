import { Pagination, Resource } from "@/Core/Domain";

export interface GetResources extends Resource.ResourceParams {
  kind: "GetResources";
}

export interface GetResourcesManifest {
  error: string;
  apiResponse: {
    data: Resource.Raw[];
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
  query: GetResources;
}
