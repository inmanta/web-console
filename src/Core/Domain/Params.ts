export interface Sort {
  name: string;
  order: SortDirection;
}

export type SortDirection = "asc" | "desc";
