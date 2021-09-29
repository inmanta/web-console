import { isObject } from "@/Core";

type Value = 5 | 10 | 20 | 50 | 100;

export interface PageSize {
  kind: "PageSize";
  value: Value;
}

export type Type = PageSize;

const listOfValues = [5, 10, 20, 50, 100];

const valueIsValid = (value: number): value is Value =>
  listOfValues.includes(value);

export const from = (value: number): PageSize => {
  if (!valueIsValid(value)) return { kind: "PageSize", value: 20 };
  return { kind: "PageSize", value };
};

export const list = [5, 10, 20, 50, 100].map(from);

export const initial = from(20);

export const equals = (a: PageSize, b: PageSize): boolean =>
  a.value === b.value;

export const is = (value: unknown): value is PageSize => {
  if (!isObject(value)) return false;
  return (
    value.kind === "PageSize" &&
    typeof value.value === "number" &&
    valueIsValid(value.value)
  );
};

export const serialize = (pageSize: PageSize): string =>
  pageSize.value.toString();

export const parse = (value: string): PageSize | null => {
  const candidate = parseInt(value);
  if (isNaN(candidate)) return null;
  return from(candidate);
};
