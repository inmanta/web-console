import { Sort } from "@/Core";
import { provide, Location, Replace, StateConfig, Update } from "./helpers";
import { handleUrlState } from "./useUrlState";

export const useUrlStateWithSort = provide(handleUrlStateWithSort);

export function handleUrlStateWithSort<Name extends string = string>(
  config: Pick<StateConfig<Sort.Type<Name>>, "route" | "default">,
  location: Location,
  replace: Replace
): [Sort.Type<Name>, Update<Sort.Type<Name>>] {
  return handleUrlState<Sort.Type<Name>>(
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
