import { isObject, DateRange, isNotUndefined } from "@/Core";
import { isEqual, pickBy } from "lodash";
import { handleUrlState } from "./useUrlState";
import { provide, Location, Replace, StateConfig, Update } from "./helpers";

export const useUrlStateWithFilter = provide(handleUrlStateWithFilter);

export function handleUrlStateWithFilter<Data>(
  config: Pick<StateConfig<Data>, "route"> & { dateRangeKey?: string },
  location: Location,
  replace: Replace
): [Data, Update<Data>] {
  const serialize = (data: Data): string | Data => {
    if (!config.dateRangeKey) return data;
    return {
      ...data,
      [config.dateRangeKey]: DateRange.serializeList(
        data[config.dateRangeKey] || []
      ),
    };
  };

  const parse = (value: unknown): Data | undefined => {
    if (!config.dateRangeKey) return value as Data;
    if (!isObject(value)) return undefined;
    return {
      ...(value as Data),
      [config.dateRangeKey]: DateRange.parseList(value[config.dateRangeKey]),
    };
  };

  return handleUrlState<Data>(
    {
      default: {} as Data,
      key: "filter",
      route: config.route,
      equals: (a: Data, b: Data): boolean =>
        isEqual(
          pickBy(a as Record<string, unknown>, isNotUndefined),
          pickBy(b as Record<string, unknown>, isNotUndefined)
        ),
      serialize,
      parse,
    },
    location,
    replace
  );
}
