import { DateRange } from "./DateRange";
import { DesiredStateVersionStatus } from "./DesiredStateVersionStatus";
import { IntRange } from "./IntRange";
import { PageSize } from "./PageSize";

export interface DesiredStateParams {
  filter?: Filter;
  pageSize: PageSize;
}

export interface Filter {
  version?: IntRange[];
  date?: DateRange[];
  status?: DesiredStateVersionStatus[];
}

export enum Kind {
  Version = "Version",
  Date = "Date",
  Status = "Status",
}

export const List: Kind[] = [Kind.Version, Kind.Date, Kind.Status];
