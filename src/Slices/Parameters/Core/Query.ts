import {
  Pagination,
  Sort,
  PageSize,
  DateRange,
  Parameter,
} from "@/Core/Domain";
import { CurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";

/**
 * Interface that represents a query to retrieve parameters.
 */
export interface Query {
  kind: "GetParameters";
  sort?: Sort.Sort<SortKey>;
  filter?: Filter;
  pageSize: PageSize.PageSize;
  currentPage: CurrentPage;
}

/**
 * Interface that represents a manifest containing parameter data.
 */
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

/**
 * Interface that represents a filter for parameters.
 */
export interface Filter {
  name?: string[];
  source?: string[];
  updated?: DateRange.Type[];
}

/**
 * Enum that represents the different kinds of filters.
 */
export enum FilterKind {
  Name = "Name",
  Source = "Source",
  Updated = "Updated",
}

/**
 * Array that represents the available filter kinds.
 */
export const FilterList: FilterKind[] = [
  FilterKind.Name,
  FilterKind.Source,
  FilterKind.Updated,
];

/**
 * Type that represents the possible sort keys for parameters.
 */
export type SortKey = "name" | "source" | "updated";
