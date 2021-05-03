export interface Sort {
  name: string;
  order: SortDirection;
}

export type SortDirection = "asc" | "desc";

export enum Operator {
  GreaterOrEqual = "greater than or equal to",
  Greater = "greater than",
  LessOrEqual = "less than or equal to",
  Less = "less than",
}
