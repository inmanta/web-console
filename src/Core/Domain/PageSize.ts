type Value = "5" | "10" | "20" | "50" | "100";

export interface PageSize {
  kind: "PageSize";
  value: Value;
}

export type Type = PageSize;

const listOfValues: string[] = ["5", "10", "20", "50", "100"];

const valueIsValid = (value: unknown): value is Value =>
  typeof value === "string" && listOfValues.includes(value);

export const from = (value: string): PageSize => {
  if (!valueIsValid(value)) return initial;
  return { kind: "PageSize", value };
};

export const list = listOfValues.map(from);

export const initial = from("100");

export const equals = (a: PageSize, b: PageSize): boolean =>
  a.value === b.value;

export const serialize = (pageSize: PageSize): string => pageSize.value;

export const parse = (candidate: unknown): PageSize | undefined => {
  return valueIsValid(candidate) ? from(candidate) : undefined;
};
