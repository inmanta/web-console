import {
  Pagination,
  Sort,
  PageSize,
  DateRange,
  CompileStatus,
} from "@/Core/Domain";
import { CurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { CompileReport } from "./Domain";

export interface Query extends CompileReportParams {
  kind: "GetCompileReports";
}

export interface Manifest {
  error: string;
  apiResponse: {
    data: CompileReport[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  data: {
    data: CompileReport[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  usedData: {
    data: CompileReport[];
    handlers: Pagination.Handlers;
    metadata: Pagination.Metadata;
  };
  query: Query;
}

export interface CompileReportParams {
  filter?: Filter;
  sort?: Sort.Sort;
  pageSize: PageSize.PageSize;
  currentPage: CurrentPage;
}

export interface Filter {
  requested?: DateRange.DateRange[];
  status?: CompileStatus;
}

export enum Kind {
  Requested = "Requested",
  Status = "Status",
}

export const List: Kind[] = [Kind.Requested, Kind.Status];
