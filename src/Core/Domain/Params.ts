export interface Sort {
  name: string;
  order: SortDirection;
}

export type SortDirection = "asc" | "desc";

export enum Operator {
  From = "from",
  To = "to",
}
