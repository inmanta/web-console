import { PageSize } from "./PageSize";
import { EventType } from "./EventType";
import { Sort } from "./Params";
import { DateRange } from "./DateRange";

export interface EventParams {
  filter?: Filter;
  sort?: Sort;
  pageSize: PageSize;
}

export enum AttributeSet {
  Active = "active_attributes",
  Candidate = "candidate_attributes",
  Rollback = "rollback_attributes",
}

export interface Filter {
  event_type?: EventType[];
  version?: string[];
  source?: string[];
  destination?: string[];
  timestamp?: DateRange[];
}

export enum Kind {
  EventType = "EventType",
  Version = "Version",
  Source = "Source",
  Destination = "Destination",
  Date = "Date",
}

export const List: Kind[] = [
  Kind.EventType,
  Kind.Version,
  Kind.Source,
  Kind.Destination,
  Kind.Date,
];
