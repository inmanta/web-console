import { CompileStatus } from "./CompileStatus";
import { DateRange } from "./DateRange";
import { PageSize } from "./PageSize";
import { Sort } from "./Sort";

export interface CompileReportParams {
  filter?: Filter;
  sort?: Sort;
  pageSize: PageSize;
}

export interface Filter {
  requested?: DateRange[];
  status?: CompileStatus;
}

export enum Kind {
  Requested = "Requested",
  Status = "Status",
}

export const List: Kind[] = [Kind.Requested, Kind.Status];
