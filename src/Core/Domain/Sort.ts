import { isObject } from "@/Core/Language";

interface Sort {
  name: string;
  direction: Direction;
}

export type Type = Sort;

export type Direction = "asc" | "desc";

const directionIsValid = (value: string): value is Direction =>
  ["asc", "desc"].includes(value);

export const equals = (a: Sort, b: Sort): boolean =>
  a.name === b.name && a.direction === b.direction;

export const is = (value: unknown): value is Sort => {
  if (!isObject(value)) return false;
  return (
    typeof value.name === "string" &&
    typeof value.direction === "string" &&
    directionIsValid(value.direction)
  );
};

export const serialize = (sort: Sort): string =>
  `${sort.name}.${sort.direction}`;

export const parse = (value: string): Sort | null => {
  const [name, direction] = value.split(".");
  if (!directionIsValid(direction)) return null;
  return { name, direction };
};
