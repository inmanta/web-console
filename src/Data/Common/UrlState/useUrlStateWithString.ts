import { identity } from "lodash-es";
import { provide, Location, Replace, StateConfig, Update } from "./helpers";
import { handleUrlState } from "./useUrlState";

export const useUrlStateWithString = provide(handleUrlStateWithString);

export function handleUrlStateWithString<Data extends string>(
  config: Pick<StateConfig<Data>, "default" | "key" | "route">,
  location: Location,
  replace: Replace,
): [Data, Update<Data>] {
  return handleUrlState<Data>(
    {
      default: config.default,
      key: config.key,
      route: config.route,
      serialize: identity,
      parse: identity,
      equals: (a: Data, b: Data) => a === b,
    },
    location,
    replace,
  );
}
