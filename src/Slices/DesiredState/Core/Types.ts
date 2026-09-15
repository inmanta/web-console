import { DateRange, IntRange } from "@/Core/Domain";
import { DesiredStateVersionStatus } from "./Domain";

export interface Filter {
  version?: IntRange.IntRange[];
  date?: DateRange.DateRange[];
  status?: DesiredStateVersionStatus[];
  disregardDefault?: boolean;
}
