import { Fact, PageSize, Pagination, Sort } from "@/Core/Domain";

export interface GetFacts extends FactsParams {
  kind: "GetFacts";
}

export interface GetFactsManifest {
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
  query: GetFacts;
}

interface FactsParams {
  sort?: Sort.Sort<SortKey>;
  filter?: Filter;
  pageSize: PageSize.PageSize;
}

interface Filter {
  name?: string[];
  resource_id?: string[];
}

type SortKey = "name" | "resource_id";
