import { PageSize } from "@/Core";
import { provide, Location, History, StateConfig, Update } from "./helpers";
import { handleUrlState } from "./useUrlState";

export const useUrlStateWithPageSize = provide(handleUrlStateWithPageSize);

export function handleUrlStateWithPageSize(
  config: Pick<StateConfig<PageSize.Type>, "route">,
  location: Location,
  history: History
): [PageSize.Type, Update<PageSize.Type>] {
  return handleUrlState<PageSize.Type>(
    {
      default: PageSize.initial,
      key: "pageSize",
      route: config.route,
      serialize: PageSize.serialize,
      parse: PageSize.parse,
      equals: PageSize.equals,
    },
    location,
    history
  );
}
