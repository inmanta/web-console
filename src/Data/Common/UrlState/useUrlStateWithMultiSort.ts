import { Sort } from "@/Core";
import { provide, Location, Replace, StateConfig, Update } from "./helpers";
import { useUrlStateHandler } from "./useUrlState";

/**
 * Synchronizes a {@link Sort.MultiSort} value with the URL query string.
 *
 * Reads and writes multiple sort criteria under the `sort` key as a
 * comma-separated string (e.g. `?sort=status.asc,createdAt.desc`).
 *
 * Built on top of {@link handleUrlState} using the MultiSort
 * serialize/parse/equals helpers, mirroring the shape of
 * {@link handleUrlStateWithSort} for single-sort.
 *
 * @returns A stateful tuple of [multiSort, setMultiSort], kept in sync with the URL.
 */
export const useUrlStateWithMultiSort = provide(useHandleUrlStateWithMultiSort);

export function useHandleUrlStateWithMultiSort<Key extends string = string>(
  config: Pick<StateConfig<Sort.MultiSort<Key>>, "route" | "default">,
  location: Location,
  replace: Replace
): [Sort.MultiSort<Key>, Update<Sort.MultiSort<Key>>] {
  return useUrlStateHandler<Sort.MultiSort<Key>>(
    {
      default: config.default ?? [],
      key: "sort",
      route: config.route,
      serialize: Sort.serializeMulti,
      parse: Sort.parseMulti,
      equals: Sort.equalsMulti,
    },
    location,
    replace
  );
}
