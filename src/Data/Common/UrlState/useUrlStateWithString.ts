import { provide, Location, Replace, StateConfig, Update } from "./helpers";
import { useUrlStateHandler } from "./useUrlState";

export const useUrlStateWithString = provide(useHandleUrlStateWithString);

export function useHandleUrlStateWithString<Data extends string>(
  config: Pick<StateConfig<Data>, "default" | "key" | "route">,
  location: Location,
  replace: Replace
): [Data, Update<Data>] {
  return useUrlStateHandler<Data>(
    {
      default: config.default,
      key: config.key,
      route: config.route,
      serialize: (data) => data,
      parse: (value) => value as Data | undefined,
      equals: (a: Data, b: Data) => a === b,
    },
    location,
    replace
  );
}
