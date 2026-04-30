import { useRef } from "react";
import { isObject } from "@/Core";
import { SearchHelper } from "@/UI/Routing/SearchHelper";
import { provide, Location, Replace, Update, StateConfig } from "./helpers";

const searchHelper = new SearchHelper();

export const useUrlState = provide(useUrlStateHandler);

export function useUrlStateHandler<Data>(
  config: StateConfig<Data>,
  location: Location,
  replace: Replace
): [Data, Update<Data>] {
  const parsedSearch = searchHelper.parse(location.search);
  const state = getKeyOrEmpty(parsedSearch, "state");
  const routeState = getKeyOrEmpty(state, config.route);
  const candidateValue = routeState[config.key];

  const parsedValue =
    typeof candidateValue !== "undefined" ? config.parse(candidateValue) : candidateValue;

  const currentValue = typeof parsedValue !== "undefined" ? parsedValue : config.default;

  // Stabilize the reference — if the value is deeply equal to what we had last render.
  // Reuse the previous object so we can get a stable reference.
  const stableRef = useRef<Data>(currentValue);
  if (!config.equals(stableRef.current, currentValue)) {
    stableRef.current = currentValue;
  }
  const stableValue = stableRef.current;

  const areEqual = (a: Data, b: Data): boolean => config.equals(a, b);

  const getSerializedValue = (value: Data) =>
    areEqual(value, config.default) ? undefined : config.serialize(value);

  const setValue = (newValue: Data) => {
    if (areEqual(newValue, stableValue)) return;

    const serialized = getSerializedValue(newValue);
    const newSearch = searchHelper.stringify({
      ...parsedSearch,
      state: {
        ...state,
        [config.route]: {
          ...routeState,
          [config.key]: serialized,
        },
      },
    });

    replace(`${location.pathname}${newSearch}${location.hash}`);
  };

  return [stableValue, setValue];
}

const getKeyOrEmpty = (obj: Record<string, unknown>, key: string) => {
  const candidate = obj[key];

  return isObject(candidate) ? candidate : {};
};
