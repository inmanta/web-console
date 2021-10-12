import { identity } from "lodash";
import { useUrlState, StateConfig, Update } from "./useUrlState";

export function useUrlStateWithString(
  config: Pick<StateConfig<string>, "default" | "key" | "route">
): [string, Update<string>] {
  return useUrlState({
    default: config.default,
    key: config.key,
    route: config.route,
    serialize: identity,
    parse: identity,
    equals: (a: string, b: string) => a === b,
  });
}
