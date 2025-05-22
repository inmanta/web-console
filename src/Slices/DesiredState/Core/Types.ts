import { DateRange, IntRange } from "@/Core/Domain";
import { DesiredStateVersionStatus } from "./Domain";

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

export const FilterList: FilterKind[] = [FilterKind.Version, FilterKind.Date, FilterKind.Status];

