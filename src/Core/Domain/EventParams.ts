import { InstanceEventType } from "./EventModel";
import { Operator, Sort } from "./Params";

export interface EventParams {
  filter?: Filter;
  sort?: Sort;
  pageSize: number;
}

export enum AttributeSet {
  Active = "active_attributes",
  Candidate = "candidate_attributes",
  Rollback = "rollback_attributes",
}

export interface Filter {
  event_type?: InstanceEventType[];
  version?: string[];
  source?: string[];
  destination?: string[];
  timestamp?: TimestampOperatorFilter[];
}

export interface TimestampOperatorFilter {
  date: Date;
  operator: Operator;
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
