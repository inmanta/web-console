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

export const serialize = (sort: Sort): string => `${sort.name}.${sort.order}`;

export const parse = (value: unknown): Sort | undefined => {
  if (typeof value !== "string") return undefined;
  const [name, order] = value.split(".");
  if (!orderIsValid(order)) return undefined;
  return { name, order };
};
