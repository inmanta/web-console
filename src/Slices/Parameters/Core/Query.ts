import {
  Pagination,
  Sort,
  PageSize,
  DateRange,
  Parameter,
} from "@/Core/Domain";
import { CurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";

export interface Query {
  kind: "GetParameters";
  sort?: Sort.Sort<SortKey>;
  filter?: Filter;
  pageSize: PageSize.PageSize;
  currentPage: CurrentPage;
}

export interface Manifest {
  error: string;
  apiResponse: {
    data: Parameter[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  data: {
    data: Parameter[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  usedData: {
    data: Parameter[];
    handlers: Pagination.Handlers;
    metadata: Pagination.Metadata;
  };
  query: Query;
}

export interface Filter {
  name?: string[];
  source?: string[];
  updated?: DateRange.Type[];
}

export enum FilterKind {
  Name = "Name",
  Source = "Source",
  Updated = "Updated",
}

export const FilterList: FilterKind[] = [
  FilterKind.Name,
  FilterKind.Source,
  FilterKind.Updated,
];

export type SortKey = "name" | "source" | "updated";
