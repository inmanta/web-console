import { isObject } from "@/Core/Language";

type Value = "5" | "10" | "20" | "50" | "100";

export interface PageSize {
  kind: "PageSize";
  value: Value;
}

export type Type = PageSize;

const listOfValues: string[] = ["5", "10", "20", "50", "100"];

const valueIsValid = (value: string): value is Value =>
  listOfValues.includes(value);

export const from = (value: string): PageSize => {
  if (!valueIsValid(value)) return initial;
  return { kind: "PageSize", value };
};

export const list = listOfValues.map(from);

export const initial = from("20");

export const equals = (a: PageSize, b: PageSize): boolean =>
  a.value === b.value;

export const is = (candidate: unknown): candidate is PageSize => {
  if (!isObject(candidate)) return false;
  return (
    candidate.kind === "PageSize" &&
    typeof candidate.value === "string" &&
    valueIsValid(candidate.value)
  );
};

export const serialize = (pageSize: PageSize): string => pageSize.value;

export const parse = (candidate: string): PageSize | null => {
  return valueIsValid(candidate) ? from(candidate) : null;
};
