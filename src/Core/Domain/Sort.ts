export interface Sort<Name extends string = string> {
  name: Name;
  order: Order;
}

export type Type<Name extends string = string> = Sort<Name>;

export type Order = "asc" | "desc";

const orderIsValid = (value: string): value is Order =>
  ["asc", "desc"].includes(value);

export const equals = (a: Sort, b: Sort): boolean =>
  a.name === b.name && a.order === b.order;

export const serialize = (sort: Sort): string => `${sort.name}.${sort.order}`;

export const parse = <Name extends string = string>(
  value: unknown
): Sort<Name> | undefined => {
  if (typeof value !== "string") return undefined;
  const [name, order] = value.split(".");
  if (!orderIsValid(order)) return undefined;
  return { name: name as Name, order };
};
