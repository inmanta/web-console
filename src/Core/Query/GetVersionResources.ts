import {
  Pagination,
  PageSize,
  Sort,
  VersionResource,
  VersionResourceFilter,
  VersionResourcesSortName,
} from "@/Core/Domain";

export interface GetVersionResources {
  kind: "GetVersionResources";
  version: string;
  filter?: VersionResourceFilter;
  sort?: Sort.Type<VersionResourcesSortName>;
  pageSize: PageSize.Type;
}

export interface GetVersionResourcesManifest {
  error: string;
  apiResponse: {
    data: VersionResource[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  data: {
    data: VersionResource[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  usedData: {
    data: VersionResource[];
    handlers: Pagination.Handlers;
    metadata: Pagination.Metadata;
  };
  query: GetVersionResources;
}
