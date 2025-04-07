import { Sort } from "@/Core";
import { provide, Location, Replace, StateConfig, Update } from "./helpers";
import { handleUrlState } from "./useUrlState";

export const useUrlStateWithSort = provide(handleUrlStateWithSort);

export function handleUrlStateWithSort<Key extends string = string>(
  config: Pick<StateConfig<Sort.Type<Key>>, "route" | "default">,
  location: Location,
  replace: Replace,
): [Sort.Type<Key>, Update<Sort.Type<Key>>] {
  return handleUrlState<Sort.Type<Key>>(
    {
      default: config.default,
      key: "sort",
      route: config.route,
      serialize: Sort.serialize,
      parse: Sort.parse,
      equals: Sort.equals,
    },
    location,
    replace,
  );
}
