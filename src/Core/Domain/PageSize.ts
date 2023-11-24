type Value = "20" | "50" | "100" | "250";

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

const listOfValues: string[] = ["20", "50", "100", "250"];

const valueIsValid = (value: unknown): value is Value =>
  typeof value === "string" && listOfValues.includes(value);

export const from = (value: string): PageSize => {
  if (!valueIsValid(value)) return initial;
  return { kind: "PageSize", value };
};

export const list = listOfValues.map(from);

export const initial = from("20");

export const equals = (a: PageSize, b: PageSize): boolean =>
  a.value === b.value;

export const serialize = (pageSize: PageSize): string => pageSize.value;

export const parse = (candidate: unknown): PageSize | undefined => {
  return valueIsValid(candidate) ? from(candidate) : undefined;
};
