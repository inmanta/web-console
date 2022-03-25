import { Pagination, Sort, PageSize } from "@/Core/Domain";
import { Agent, AgentStatus } from "./Domain";

export interface Query {
  kind: "GetAgents";
  filter?: Filter;
  sort?: Sort.Sort;
  pageSize: PageSize.PageSize;
}

export interface Manifest {
  error: string;
  apiResponse: {
    data: Agent[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  data: {
    data: Agent[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  usedData: {
    data: Agent[];
    handlers: Pagination.Handlers;
    metadata: Pagination.Metadata;
  };
  query: Query;
}

export interface Filter {
  name?: string[];
  process_name?: string[];
  status?: AgentStatus[];
}
