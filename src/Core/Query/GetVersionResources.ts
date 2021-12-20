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
  apiResponse: Resource.ResponseFromVersion;
  data: Resource.ResponseFromVersion;
  usedData: {
    data: Resource.FromVersion[];
    handlers: Pagination.Handlers;
    metadata: Pagination.Metadata;
  };
  query: GetVersionResources;
}
