import { identity } from "lodash";
import { useUrlState, StateConfig, Update } from "./useUrlState";

export function useUrlStateWithString<Data extends string>(
  config: Pick<StateConfig<Data>, "default" | "key" | "route">
): [Data, Update<Data>] {
  return useUrlState({
    default: config.default,
    key: config.key,
    route: config.route,
    serialize: identity,
    parse: identity,
    equals: (a: Data, b: Data) => a === b,
  });
}
