import { PageSize, Pagination, Sort } from "@/Core/Domain";
import { Fact } from "./Domain";

export interface Query {
  kind: "GetFacts";
  sort?: Sort.Sort<SortKey>;
  filter?: Filter;
  pageSize: PageSize.PageSize;
}

export interface Manifest {
  error: string;
  apiResponse: {
    data: Fact[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  data: {
    data: Fact[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  usedData: {
    data: Fact[];
    handlers: Pagination.Handlers;
    metadata: Pagination.Metadata;
  };
  query: Query;
}

export interface Filter {
  name?: string[];
  resource_id?: string[];
}

export type SortKey = "name" | "resource_id";
