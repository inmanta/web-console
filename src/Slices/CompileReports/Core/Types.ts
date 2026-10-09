import { DateRange, CompileStatus } from "@/Core/Domain";

export interface Filter {
  requested?: DateRange.DateRange[];
  status?: CompileStatus;
}
