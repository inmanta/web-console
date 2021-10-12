import { PageSize } from "./PageSize";
import { Sort, TimestampOperatorFilter } from "./Params";

export interface CompileReportParams {
  filter?: Filter;
  sort?: Sort;
  pageSize: PageSize;
}

export interface Filter {
  requested?: TimestampOperatorFilter[];
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
