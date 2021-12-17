import { Pagination, PageSize, Sort, Resource } from "@/Core/Domain";

export interface GetVersionResources {
  kind: "GetVersionResources";
  version: string;
  filter?: Resource.FilterFromVersion;
  sort?: Sort.Type<Resource.SortKeyFromVersion>;
  pageSize: PageSize.Type;
}

export interface GetVersionResourcesManifest {
  error: string;
  apiResponse: {
    data: Resource.FromVersion[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  data: {
    data: Resource.FromVersion[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  usedData: {
    data: Resource.FromVersion[];
    handlers: Pagination.Handlers;
    metadata: Pagination.Metadata;
  };
  query: GetVersionResources;
}
