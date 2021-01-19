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
  candidate: Pairs | null;
  active: Pairs | null;
  rollback: Pairs | null;
}

export interface Row {
  id: Id;
  state: string;
  attributesSummary: AttributesSummary;
  attributes: Attributes;
  createdAt: DateInfo;
  updatedAt: DateInfo;
}
