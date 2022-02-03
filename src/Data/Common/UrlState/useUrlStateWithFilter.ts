import { isEqual, pickBy } from "lodash-es";
import {
  isObject,
  DateRange,
  isNotUndefined,
  IntRange,
  stringToBoolean,
} from "@/Core";
import { provide, Location, StateConfig, Update, Replace } from "./helpers";
import { handleUrlState } from "./useUrlState";

export const useUrlStateWithFilter = provide(handleUrlStateWithFilter);

export function handleUrlStateWithFilter<Data>(
  config: Pick<StateConfig<Data>, "route"> & {
    dateRangeKey?: string;
    intRangeKey?: string;
    booleanKey?: string;
  },
  location: Location,
  replace: Replace
): [Data, Update<Data>] {
  const serialize = (data: Data): string | Data => {
    const serializedDateRange =
      config.dateRangeKey && data[config.dateRangeKey] !== undefined
        ? {
            [config.dateRangeKey]: DateRange.serializeList(
              data[config.dateRangeKey] || []
            ),
          }
        : {};
    const serializedIntRange =
      config.intRangeKey && data[config.intRangeKey] !== undefined
        ? {
            [config.intRangeKey]: IntRange.serializeList(
              data[config.intRangeKey] || []
            ),
          }
        : {};
    const serializedBoolean =
      config.booleanKey && data[config.booleanKey] !== undefined
        ? {
            [config.booleanKey]: `${data[config.booleanKey]}`,
          }
        : {};
    return {
      ...data,
      ...serializedBoolean,
      ...serializedDateRange,
      ...serializedIntRange,
    };
  };

  const parse = (value: unknown): Data | undefined => {
    if (!config.dateRangeKey && !config.intRangeKey && !config.booleanKey)
      return value as Data;
    if (!isObject(value)) return undefined;
    const parsedDateRange =
      config.dateRangeKey && value[config.dateRangeKey] !== undefined
        ? {
            [config.dateRangeKey]: DateRange.parseList(
              value[config.dateRangeKey]
            ),
          }
        : {};
    const parsedIntRange =
      config.intRangeKey && value[config.intRangeKey] !== undefined
        ? {
            [config.intRangeKey]: IntRange.parseList(value[config.intRangeKey]),
          }
        : {};

    const parsedBoolean =
      config.booleanKey && value[config.booleanKey] !== undefined
        ? {
            [config.booleanKey]: stringToBoolean(value[config.booleanKey]),
          }
        : {};
    return {
      ...(value as Data),
      ...parsedBoolean,
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
