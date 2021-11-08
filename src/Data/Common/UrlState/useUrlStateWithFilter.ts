import { isEqual, pickBy } from "lodash";
import { isObject, DateRange, isNotUndefined } from "@/Core";
import { provide, Location, StateConfig, Update, Replace } from "./helpers";
import { handleUrlState } from "./useUrlState";

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
