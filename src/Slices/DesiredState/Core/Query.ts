import { DateRange, IntRange, PageSize, Pagination } from "@/Core/Domain";
import { CurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { DesiredStateVersion, DesiredStateVersionStatus } from "./Domain";

export interface DesiredStateParams {
  filter?: Filter;
  pageSize: PageSize.PageSize;
  currentPage: CurrentPage;
}

export interface Filter {
  version?: IntRange.IntRange[];
  date?: DateRange.DateRange[];
  status?: DesiredStateVersionStatus[];
}

export enum FilterKind {
  Version = "Version",
  Date = "Date",
  Status = "Status",
}

export const FilterList: FilterKind[] = [
  FilterKind.Version,
  FilterKind.Date,
  FilterKind.Status,
];

export interface Query extends DesiredStateParams {
  kind: "GetDesiredStates";
}

export interface Manifest {
  error: string;
  apiResponse: {
    data: DesiredStateVersion[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  data: {
    data: DesiredStateVersion[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  usedData: {
    data: DesiredStateVersion[];
    handlers: Pagination.Handlers;
    metadata: Pagination.Metadata;
  };
  query: Query;
}
