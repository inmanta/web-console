export type Status =
  | "added"
  | "modified"
  | "deleted"
  | "unmodified"
  | "agent_down"
  | "undefined"
  | "skipped_for_undefined";

export const statuses: Status[] = [
  "added",
  "modified",
  "deleted",
  "unmodified",
  "agent_down",
  "undefined",
  "skipped_for_undefined",
];

export const defaultStatuses: Status[] = [
  "added",
  "modified",
  "deleted",
  "agent_down",
  "undefined",
  "skipped_for_undefined",
];

interface ValueSet {
  from_value: unknown;
  to_value: unknown;
  from_value_compare: string;
  to_value_compare: string;
}

export interface Resource {
  resource_id: string;
  attributes: Record<string, ValueSet>;
  status: Status;
}

export interface Identifiers {
  from: string;
  to: string;
}

export type Values = Identifiers;
