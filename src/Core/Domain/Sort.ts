export interface Sort<Key extends string = string> {
  name: Key;
  order: Order;
}

export type Type<Key extends string = string> = Sort<Key>;

export type Order = "asc" | "desc";

const orderIsValid = (value: string): value is Order =>
  ["asc", "desc"].includes(value);

export const equals = (a: Sort, b: Sort): boolean =>
  a.name === b.name && a.order === b.order;

export const serialize = (sort: Sort): string => `${sort.name}.${sort.order}`;

export const parse = <Key extends string = string>(
  value: unknown,
): Sort<Key> | undefined => {
  if (typeof value !== "string") return undefined;
  const [name, order] = value.split(".");
  if (!orderIsValid(order)) return undefined;
  return { name: name as Key, order };
};
