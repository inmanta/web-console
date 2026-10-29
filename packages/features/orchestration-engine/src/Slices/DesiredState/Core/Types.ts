import { DateRange, IntRange } from "@inmanta/web-console-core/Domain";
import { DesiredStateVersionStatus } from "@inmanta/web-console-core/Domain/DesiredStateVersion";

export interface Filter {
  version?: IntRange.IntRange[];
  date?: DateRange.DateRange[];
  status?: DesiredStateVersionStatus[];
  disregardDefault?: boolean;
}
