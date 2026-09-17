import { EventType, DateRange } from "@/Core/Domain";

export interface Filter {
  event_type?: EventType[];
  version?: string[];
  source?: string[];
  destination?: string[];
  timestamp?: DateRange.DateRange[];
}
