import {
  Pagination,
  Resource,
  RawResource,
  ResourceParams,
  ResourceMetadata,
} from "@/Core/Domain";

export interface GetResources extends ResourceParams.ResourceParams {
  kind: "GetResources";
}

export interface GetResourcesManifest {
  error: string;
  apiResponse: {
    data: RawResource[];
    links: Pagination.Links;
    metadata: ResourceMetadata;
  };
  data: {
    data: Resource[];
    links: Pagination.Links;
    metadata: ResourceMetadata;
  };
  usedData: {
    data: Resource[];
    handlers: Pagination.Handlers;
    metadata: ResourceMetadata;
  };
  query: GetResources;
}
