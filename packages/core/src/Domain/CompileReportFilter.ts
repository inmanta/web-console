import { CompileStatus } from "./CompileStatus";
import * as DateRange from "./DateRange";

export interface Filter {
  requested?: DateRange.DateRange[];
  status?: CompileStatus;
}
