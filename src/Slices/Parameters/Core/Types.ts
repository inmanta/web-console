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
 * Enum that represents the different kinds of filters.
 */
export enum FilterKind {
  Name = "Name",
  Source = "Source",
  Updated = "Updated",
}

/**
 * Array that represents the available filter kinds.
 */
export const FilterList: FilterKind[] = [FilterKind.Name, FilterKind.Source, FilterKind.Updated];

/**
 * Type that represents the possible sort keys for parameters.
 */
export type SortKey = "name" | "source" | "updated";
