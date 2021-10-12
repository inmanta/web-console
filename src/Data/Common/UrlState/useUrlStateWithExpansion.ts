import { isEqual, identity } from "lodash";
import { useUrlState, StateConfig, Update } from "./useUrlState";

export function useUrlStateWithExpansion(
  config: Pick<StateConfig<string[]>, "route">
): [string[], Update<string[]>] {
  return useUrlState<string[]>({
    default: [],
    key: "expansion",
    route: config.route,
    serialize: identity,
    parse: identity,
    equals: isEqual,
  });
}
