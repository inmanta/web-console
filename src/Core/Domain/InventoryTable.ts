export interface Id {
  full: string;
  short: string;
}

export interface DateInfo {
  full: string;
  relative: string;
}

export interface AttributesSummary {
  candidate: boolean;
  active: boolean;
  rollback: boolean;
}

export type Pairs = [string, string][];

export interface Attributes {
  candidate: Record<string, unknown> | null;
  active: Record<string, unknown> | null;
  rollback: Record<string, unknown> | null;
}

export interface Row {
  id: Id;
  state: string;
  attributesSummary: AttributesSummary;
  attributes: Attributes;
  createdAt: DateInfo;
  updatedAt: DateInfo;
  version: number;
  instanceSetStateTargets: string[];
}

export interface State {
  name: string;
  label?: "info" | "success" | "danger" | "warning";
}
