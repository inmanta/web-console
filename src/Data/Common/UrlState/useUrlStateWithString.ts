import { identity } from "lodash";
import { handleUrlState } from "./useUrlState";
import { provide, Location, History, StateConfig, Update } from "./helpers";

export const useUrlStateWithString = provide(handleUrlStateWithString);

export function handleUrlStateWithString<Data extends string>(
  config: Pick<StateConfig<Data>, "default" | "key" | "route">,
  location: Location,
  history: History
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
    history
  );
}
