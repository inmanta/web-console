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

interface Keys {
  keys?: Record<string, "IntRange" | "DateRange" | "Boolean">;
}

export const useUrlStateWithFilter = provide(handleUrlStateWithFilter);

const serializeValue = (
  kind: "IntRange" | "DateRange" | "Boolean",
  value: unknown
): string | string[] => {
  switch (kind) {
    case "Boolean":
      return `${value}`;
    case "DateRange":
      return DateRange.serializeList(value as DateRange.DateRange[]);
    case "IntRange":
      return IntRange.serializeList(value as IntRange.IntRange[]);
  }
};

const parseValue = (
  kind: "IntRange" | "DateRange" | "Boolean",
  value: unknown
): boolean | undefined | DateRange.DateRange[] | IntRange.IntRange[] => {
  switch (kind) {
    case "Boolean":
      return stringToBoolean(value);
    case "DateRange":
      return DateRange.parseList(value);
    case "IntRange":
      return IntRange.parseList(value);
  }
};

export function handleUrlStateWithFilter<Data>(
  config: Pick<StateConfig<Data>, "route"> & Keys,
  location: Location,
  replace: Replace
): [Data, Update<Data>] {
  const serialize = (data: Data): Data => {
    if (config.keys === undefined) return data;
    const serialized = Object.entries(config.keys)
      .map(([key, kind]) => {
        if (data[key] === undefined) return {};
        return { [key]: serializeValue(kind, data[key]) };
      })
      .reduce((acc, cur) => ({ ...acc, ...cur }), {});
    return { ...data, ...serialized };
  };

  const parse = (value: unknown): Data | undefined => {
    if (config.keys === undefined) return value as Data;
    if (!isObject(value)) return undefined;
    const parsed = Object.entries(config.keys)
      .map(([key, kind]) => {
        if (value[key] === undefined) return {};
        return { [key]: parseValue(kind, value[key]) };
      })
      .reduce((acc, cur) => ({ ...acc, ...cur }), {});
    return { ...(value as Data), ...parsed };
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
