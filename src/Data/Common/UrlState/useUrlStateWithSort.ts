import { Sort } from "@/Core";
import { provide, Location, Replace, StateConfig, Update } from "./helpers";
import { useUrlStateHandler } from "./useUrlState";

export const useUrlStateWithSort = provide(useUrlStateWithSortHandler);

export function useUrlStateWithSortHandler<Key extends string = string>(
  config: Pick<StateConfig<Sort.Type<Key>>, "route" | "default">,
  location: Location,
  replace: Replace
): [Sort.Type<Key>, Update<Sort.Type<Key>>] {
  return useUrlStateHandler<Sort.Type<Key>>(
    {
      default: config.default,
      key: "sort",
      route: config.route,
      serialize: Sort.serialize,
      parse: Sort.parse,
      equals: Sort.equals,
    },
    location,
    replace
  );
}
