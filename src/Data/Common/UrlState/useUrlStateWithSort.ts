import { Sort } from "@/Core";
import { handleUrlState } from "./useUrlState";
import { provide, Location, History, StateConfig, Update } from "./helpers";

export const useUrlStateWithSort = provide(handleUrlStateWithSort);

export function handleUrlStateWithSort(
  config: Pick<StateConfig<Sort.Type>, "route" | "default">,
  location: Location,
  history: History
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
    history
  );
}
