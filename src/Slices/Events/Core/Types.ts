import { EventType, DateRange } from "@/Core/Domain";

export interface Filter {
  event_type?: EventType[];
  version?: string[];
  source?: string[];
  destination?: string[];
  timestamp?: DateRange.DateRange[];
}

export enum FilterKind {
  EventType = "EventType",
  Version = "Version",
  Source = "Source",
  Destination = "Destination",
  Date = "Date",
}

export const FilterList: FilterKind[] = [
  FilterKind.EventType,
  FilterKind.Version,
  FilterKind.Source,
  FilterKind.Destination,
  FilterKind.Date,
];
