import { Pagination, PageSize, Sort } from "@/Core/Domain";
import { ResourceLog, ResourceLogFilter } from "./ResourceLog";

export interface Query {
  kind: "GetResourceLogs";
  id: string;
  filter?: ResourceLogFilter;
  sort?: Sort.Type;
  pageSize: PageSize.Type;
}

export interface Manifest {
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
  query: Query;
}
