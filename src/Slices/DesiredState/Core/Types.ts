import { DateRange, IntRange } from "@/Core/Domain";
import { DesiredStateVersionStatus } from "@/Core/Domain/DesiredStateVersion";

export interface Filter {
  version?: IntRange.IntRange[];
  date?: DateRange.DateRange[];
  status?: DesiredStateVersionStatus[];
  disregardDefault?: boolean;
}
