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

export interface Row {
  id: Id;
  state: string;
  attributesSummary: AttributesSummary;
  createdAt: DateInfo;
  updatedAt: DateInfo;
}
