import {
  Pagination,
  Resource,
  RawResource,
  ResourceParams,
} from "@/Core/Domain";

export interface GetResources extends ResourceParams.ResourceParams {
  kind: "GetResources";
}

export interface GetResourcesManifest {
  error: string;
  apiResponse: {
    data: RawResource[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  data: {
    data: Resource[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  usedData: {
    data: Resource[];
    handlers: Pagination.Handlers;
    metadata: Pagination.Metadata;
  };
  query: GetResources;
}
