import { PageSize } from "@/Core";
import { useUrlState, StateConfig, Update } from "./useUrlState";

export function useUrlStateWithPageSize(
  config: Pick<StateConfig<PageSize.Type>, "route">
): [PageSize.Type, Update<PageSize.Type>] {
  return useUrlState({
    default: PageSize.initial,
    key: "pageSize",
    route: config.route,
    validator: PageSize.is,
    serialize: PageSize.serialize,
    parse: PageSize.parse,
    equals: PageSize.equals,
  });
}
