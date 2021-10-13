import { PageSize } from "./PageSize";
import { Sort } from "./Sort";
import { DateRange } from "./DateRange";

export interface CompileReportParams {
  filter?: Filter;
  sort?: Sort;
  pageSize: PageSize;
}

export interface Filter {
  requested?: DateRange[];
  success?: boolean;
  status?: CompileStatus[];
}

export enum CompileStatus {
  InProgress = "In Progress",
  Finished = "Finished",
  Queued = "Queued",
}

export enum Kind {
  Requested = "Requested",
  Result = "Result",
  Status = "Status",
}

export const List: Kind[] = [Kind.Requested, Kind.Result, Kind.Status];
