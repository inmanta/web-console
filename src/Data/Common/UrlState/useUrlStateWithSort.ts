import { Sort } from "@/Core";
import { useUrlState, StateConfig, Update } from "./useUrlState";

export function useUrlStateWithSort(
  config: Pick<StateConfig<Sort.Type>, "route" | "default">
): [Sort.Type, Update<Sort.Type>] {
  return useUrlState<Sort.Type>({
    default: config.default,
    key: "sort",
    route: config.route,
    validator: Sort.is,
    serialize: Sort.serialize,
    parse: Sort.parse,
    equals: Sort.equals,
  });
}
