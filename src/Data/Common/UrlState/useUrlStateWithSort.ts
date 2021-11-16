import { Sort } from "@/Core";
import { provide, Location, Replace, StateConfig, Update } from "./helpers";
import { handleUrlState } from "./useUrlState";

export const useUrlStateWithSort = provide(handleUrlStateWithSort);

export function handleUrlStateWithSort(
  config: Pick<StateConfig<Sort.Type>, "route" | "default">,
  location: Location,
  replace: Replace
): [Sort.Type, Update<Sort.Type>] {
  return handleUrlState<Sort.Type>(
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
