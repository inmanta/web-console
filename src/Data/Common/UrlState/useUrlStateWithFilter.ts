import { isObject, DateRange, isNotUndefined } from "@/Core";
import { isEqual, pickBy } from "lodash";
import { handleUrlState } from "./useUrlState";
import { provide, Location, History, StateConfig, Update } from "./helpers";

type Config = "DateRange";

interface ExtraConfig {
  filters?: Record<string, Config>;
}

const getSerializer = (config: Config) => {
  switch (config) {
    case "DateRange":
      return DateRange.serializeList;
  }
};

const getParser = (config: Config) => {
  switch (config) {
    case "DateRange":
      return DateRange.parseList;
  }
};

export const useUrlStateWithFilter = provide(handleUrlStateWithFilter);

export function handleUrlStateWithFilter<Data>(
  config: Pick<StateConfig<Data>, "route"> & ExtraConfig,
  location: Location,
  history: History
): [Data, Update<Data>] {
  const serialize = (data: Data): string | Data => {
    if (!config.filters) return data;
    return Object.entries(config.filters).reduce((acc, [key, category]) => {
      acc[key] = getSerializer(category)(data[key] || []);
      return acc;
    }, data);
  };

  const parse = (value: unknown): Data | undefined => {
    if (!config.filters) return value as Data;
    if (!isObject(value)) return undefined;
    return Object.entries(config.filters).reduce((acc, [key, category]) => {
      acc[key] = getParser(category)(value[key]);
      return acc;
    }, value as Data);
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
    history
  );
}
