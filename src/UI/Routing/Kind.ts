const kinds = [
  "Home",
  "Catalog",
  "Inventory",
  "CreateInstance",
  "EditInstance",
  "History",
  "Diagnose",
  "Events",
  "Resources",
  "CompileReports",
  "CompileDetails",
  "ResourceDetails",
  "Settings",
] as const;

export type Kind = typeof kinds[number];

export const isValidKind = (value: string): value is Kind =>
  kinds.includes(value as Kind);
