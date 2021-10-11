import { isObject } from "@/Core/Language";

export interface Sort {
  name: string;
  order: Order;
}

export type Type = Sort;

export type Order = "asc" | "desc";

const orderIsValid = (value: string): value is Order =>
  ["asc", "desc"].includes(value);

export const equals = (a: Sort, b: Sort): boolean =>
  a.name === b.name && a.order === b.order;

export const is = (value: unknown): value is Sort => {
  if (!isObject(value)) return false;
  return (
    typeof value.name === "string" &&
    typeof value.order === "string" &&
    orderIsValid(value.order)
  );
};

export const serialize = (sort: Sort): string => `${sort.name}.${sort.order}`;

export const parse = (value: string): Sort | null => {
  const [name, order] = value.split(".");
  if (!orderIsValid(order)) return null;
  return { name, order };
};
