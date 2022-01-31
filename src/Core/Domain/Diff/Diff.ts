export type Status = "added" | "modified" | "deleted";

export interface ValueSet {
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
