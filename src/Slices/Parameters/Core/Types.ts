import { DateRange } from "@/Core/Domain";

/**
 * Interface that represents a filter for parameters.
 */
export interface Filter {
  name?: string[];
  source?: string[];
  updated?: DateRange.Type[];
}

/**
 * Type that represents the possible sort keys for parameters.
 */
export type SortKey = "name" | "source" | "updated";
