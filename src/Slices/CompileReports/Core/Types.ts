import { DateRange, CompileStatus } from "@/Core/Domain";

export interface Filter {
  requested?: DateRange.DateRange[];
  status?: CompileStatus;
}

export enum Kind {
  Requested = "Requested",
  Status = "Status",
}

export const List: Kind[] = [Kind.Requested, Kind.Status];
