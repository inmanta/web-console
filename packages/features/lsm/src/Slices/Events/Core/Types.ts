import { EventType, DateRange } from "@inmanta/web-console-core/Domain";

export interface Filter {
  event_type?: EventType[];
  version?: string[];
  source?: string[];
  destination?: string[];
  timestamp?: DateRange.DateRange[];
}
