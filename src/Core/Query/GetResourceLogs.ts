import {
  Pagination,
  ResourceLog,
  ResourceLogFilter,
  PageSize,
  Sort,
} from "@/Core/Domain";

export interface GetResourceLogs {
  kind: "GetResourceLogs";
  id: string;
  filter?: ResourceLogFilter;
  sort?: Sort.Type;
  pageSize: PageSize.Type;
}

export interface GetResourceLogsManifest {
  error: string;
  apiResponse: {
    data: ResourceLog[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  data: {
    data: ResourceLog[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  usedData: {
    data: ResourceLog[];
    handlers: Pagination.Handlers;
    metadata: Pagination.Metadata;
  };
  query: GetResourceLogs;
}
