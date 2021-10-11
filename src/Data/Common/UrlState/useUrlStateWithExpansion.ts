import { isEqual } from "lodash";
import { useUrlState, StateConfig, Update } from "./useUrlState";

export function useUrlStateWithExpansion(
  config: Pick<StateConfig<string[]>, "route">
): [string[], Update<string[]>] {
  return useUrlState<string[]>({
    default: [],
    key: "expansion",
    route: config.route,
    validator: (v: unknown): v is string[] => Array.isArray(v),
    equals: isEqual,
  });
}
