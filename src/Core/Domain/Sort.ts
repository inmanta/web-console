export interface Sort<Key extends string = string> {
  name: Key;
  order: Order;
}

export type Type<Key extends string = string> = Sort<Key>;

export type Order = "asc" | "desc";

const orderIsValid = (value: string): value is Order => ["asc", "desc"].includes(value);

export const equals = (a: Sort, b: Sort): boolean => a.name === b.name && a.order === b.order;

export const serialize = (sort: Sort): string => `${sort.name}.${sort.order}`;

export const parse = <Key extends string = string>(value: unknown): Sort<Key> | undefined => {
  if (typeof value !== "string") return undefined;

  const [name, order] = value.split(".");

  if (!orderIsValid(order)) return undefined;

  return { name: name as Key, order };
};

/**
 * Represents an array of sort criteria applied simultaneously.
 * Each entry targets a different column; order in the array determines priority.
 *
 * @example
 * [{ name: "status", order: "asc" }, { name: "createdAt", order: "desc" }]
 */
export type MultiSort<Key extends string = string> = Sort<Key>[];

/**
 * Checks deep equality between two MultiSort arrays.
 * Order of entries matters — [a, b] is not equal to [b, a].
 */
export const equalsMulti = <Key extends string>(a: MultiSort<Key>, b: MultiSort<Key>): boolean =>
  a.length === b.length &&
  a.every((item, i) => item.name === b[i].name && item.order === b[i].order);

/**
 * Serializes a MultiSort array into a URL-safe string.
 * Each entry is serialized with the existing {@link serialize} format, joined by commas.
 *
 * @example
 * serializeMulti([{ name: "status", order: "asc" }, { name: "createdAt", order: "desc" }])
 * // → "status.asc,createdAt.desc"
 */
export const serializeMulti = <Key extends string>(sorts: MultiSort<Key>): string =>
  sorts.map(serialize).join(",");

/**
 * Parses a serialized MultiSort string back into a MultiSort array.
 * Entries that fail {@link parse} validation are silently dropped.
 * Returns an empty array for any non-string or empty input.
 *
 * @example
 * parseMulti("status.asc,createdAt.desc")
 * // → [{ name: "status", order: "asc" }, { name: "createdAt", order: "desc" }]
 */
export const parseMulti = <Key extends string>(value: unknown): MultiSort<Key> => {
  if (typeof value !== "string" || !value) return [];
  return value.split(",").flatMap((part) => {
    const parsed = parse<Key>(part);
    return parsed ? [parsed] : [];
  });
};

/**
 * Toggles a column's sort entry within a MultiSort array.
 * Cycles through three states, leaving all other entries untouched:
 *  - absent → appended as `asc`
 *  - `asc`  → updated to `desc`
 *  - `desc` → removed
 *
 * Intended for column header click handlers in multi-sort tables.
 */
export const toggleMulti = <Key extends string>(
  sorts: MultiSort<Key>,
  name: Key
): MultiSort<Key> => {
  const existing = sorts.find((s) => s.name === name);

  if (!existing) return [...sorts, { name, order: "asc" }];
  if (existing.order === "asc")
    return sorts.map((s) => (s.name === name ? { ...s, order: "desc" as Order } : s));
  return sorts.filter((s) => s.name !== name);
};
