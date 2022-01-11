import { isEqual, pickBy } from "lodash-es";
import { isObject, DateRange, isNotUndefined, IntRange } from "@/Core";
import { provide, Location, StateConfig, Update, Replace } from "./helpers";
import { handleUrlState } from "./useUrlState";

export const useUrlStateWithFilter = provide(handleUrlStateWithFilter);

export function handleUrlStateWithFilter<Data>(
  config: Pick<StateConfig<Data>, "route"> & {
    dateRangeKey?: string;
    intRangeKey?: string;
  },
  location: Location,
  replace: Replace
): [Data, Update<Data>] {
  const serialize = (data: Data): string | Data => {
    const serializedDateRange = config.dateRangeKey
      ? {
          [config.dateRangeKey]: DateRange.serializeList(
            data[config.dateRangeKey] || []
          ),
        }
      : {};
    const serializedIntRange = config.intRangeKey
      ? {
          [config.intRangeKey]: IntRange.serializeList(
            data[config.intRangeKey] || []
          ),
        }
      : {};
    return {
      ...data,
      ...serializedDateRange,
      ...serializedIntRange,
    };
  };

  const parse = (value: unknown): Data | undefined => {
    if (!config.dateRangeKey && !config.intRangeKey) return value as Data;
    if (!isObject(value)) return undefined;
    const parsedDateRange = config.dateRangeKey
      ? {
          [config.dateRangeKey]: DateRange.parseList(
            value[config.dateRangeKey]
          ),
        }
      : {};
    const parsedIntRange = config.intRangeKey
      ? { [config.intRangeKey]: IntRange.parseList(value[config.intRangeKey]) }
      : {};
    return {
      ...(value as Data),
      ...parsedDateRange,
      ...parsedIntRange,
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
