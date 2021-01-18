export interface Id {
  full: string;
  short: string;
}

export interface DateInfo {
  full: string;
  relative: string;
}

export interface AttributeInfo {
  candidate: boolean;
  active: boolean;
  rollback: boolean;
}

export interface Row {
  id: Id;
  state: string;
  attributes: AttributeInfo;
  createdAt: DateInfo;
  updatedAt: DateInfo;
}
