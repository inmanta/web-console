type Value = "1" | "5" | "20" | "50" | "100" | "250";

// User-facing page-size pickers (PaginationWidget) source their options from this list only, so
// adding "1"/"5" to Value/listOfValues below (for count-only/latest-few queries that don't need a
// real page of results) doesn't add them as selectable options anywhere in the app.
export const PaginationPageSizes = [
  { title: "20", value: 20 },
  { title: "50", value: 50 },
  { title: "100", value: 100 },
  { title: "250", value: 250 },
];

export interface PageSize {
  kind: "PageSize";
  value: Value;
}

export type Type = PageSize;

const listOfValues: string[] = ["1", "5", "20", "50", "100", "250"];

const valueIsValid = (value: unknown): value is Value =>
  typeof value === "string" && listOfValues.includes(value);

export const from = (value: string): PageSize => {
  if (!valueIsValid(value)) {
    return initial;
  }

  return { kind: "PageSize", value };
};

export const initial = from("20");

/**
 * Smallest valid page size. For requests that only read aggregate/metadata fields (e.g.
 * `metadata.total`, a GraphQL summary field) or a single latest/first row, not the actual page of
 * results — fetching 20 rows to discard them would be wasteful.
 */
export const minimal = from("1");

/**
 * For widgets that show a handful of the most recent items without paginating (e.g. Dashboard
 * V2's Latest Compile Reports panel) — smaller than `initial` ("20") since only a few rows are
 * ever rendered.
 */
export const few = from("5");

export const equals = (a: PageSize, b: PageSize): boolean => a.value === b.value;

export const serialize = (pageSize: PageSize): string => pageSize.value;

export const parse = (candidate: unknown): PageSize | undefined => {
  return valueIsValid(candidate) ? from(candidate) : undefined;
};
