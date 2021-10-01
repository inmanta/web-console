export type Kinds =
  | "Catalog"
  | "Inventory"
  | "CreateInstance"
  | "EditInstance"
  | "History"
  | "Diagnose"
  | "Events"
  | "Resources"
  | "CompileReports"
  | "CompileDetails"
  | "Home"
  | "ResourceDetails";

const list = [
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
];

export const isValidKind = (value: string): value is Kinds =>
  list.includes(value);
