import { Sort } from "@/Core";
import { provide, Location, Replace, StateConfig, Update } from "./helpers";
import { useUrlStateHandler } from "./useUrlState";

/**
 * Represents an array of sort criteria applied simultaneously.
 * Each entry targets a different column; order in the array determines priority.
 *
 * @example
 * [{ name: "status", order: "asc" }, { name: "createdAt", order: "desc" }]
 */
export type MultiSort<Key extends string = string> = Sort.Sort<Key>[];

/**
 * Checks deep equality between two MultiSort arrays.
 * Order of entries matters — [a, b] is not equal to [b, a].
 */
export const equalsMulti = <Key extends string>(a: MultiSort<Key>, b: MultiSort<Key>): boolean => {
  return (
    a.length === b.length &&
    a.every(({ name, order }, i) => {
      const other = b[i];
      return name === other.name && order === other.order;
    })
  );
};

/**
 * Serializes a MultiSort array into a URL-safe string.
 * Each entry is serialized with the existing {@link Sort.serialize} format, joined by commas.
 *
 * @example
 * serializeMulti([{ name: "status", order: "asc" }, { name: "createdAt", order: "desc" }])
 * // → "status.asc,createdAt.desc"
 */
export const serializeMulti = <Key extends string>(sorts: MultiSort<Key>): string => {
  return sorts.map(Sort.serialize).join(",");
};

/**
 * Parses a serialized MultiSort string back into a MultiSort array.
 * Entries that fail {@link Sort.parse} validation are silently dropped.
 * Returns an empty array for any non-string or empty input.
 *
 * @example
 * parseMulti("status.asc,createdAt.desc")
 * // → [{ name: "status", order: "asc" }, { name: "createdAt", order: "desc" }]
 */
export const parseMulti = <Key extends string>(value: unknown): MultiSort<Key> => {
  if (typeof value !== "string" || !value) {
    return [];
  }
  return value.split(",").flatMap((part) => {
    const parsed = Sort.parse<Key>(part);
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

  if (!existing) {
    return [...sorts, { name, order: "asc" }];
  }

  if (existing.order === "asc") {
    return sorts.map((s) => (s.name === name ? { ...s, order: "desc" } : s));
  }

  return sorts.filter((s) => s.name !== name);
};

/**
 * Synchronizes a {@link MultiSort} value with the URL query string.
 *
 * Reads and writes multiple sort criteria under the `sort` key as a
 * comma-separated string (e.g. `?sort=status.asc,createdAt.desc`).
 *
 * Built on top of {@link useUrlStateHandler} using the MultiSort
 * serialize/parse/equals helpers, mirroring the shape of
 * {@link useUrlStateWithSortHandler} for single-sort.
 *
 * @returns A stateful tuple of [multiSort, setMultiSort], kept in sync with the URL.
 */
export const useUrlStateWithMultiSort = provide(useHandleUrlStateWithMultiSort);

export function useHandleUrlStateWithMultiSort<Key extends string = string>(
  config: Pick<StateConfig<MultiSort<Key>>, "route" | "default">,
  location: Location,
  replace: Replace
): [MultiSort<Key>, Update<MultiSort<Key>>] {
  return useUrlStateHandler<MultiSort<Key>>(
    {
      default: config.default ?? [],
      key: "sort",
      route: config.route,
      serialize: serializeMulti,
      parse: parseMulti,
      equals: equalsMulti,
    },
    location,
    replace
  );
}
