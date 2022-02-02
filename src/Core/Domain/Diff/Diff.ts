export type Status = "added" | "modified" | "deleted";

export interface ValueSet {
  from_value: unknown;
  to_value: unknown;
  from_value_compare: string | null;
  to_value_compare: string | null;
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
