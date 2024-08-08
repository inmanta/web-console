import { isObject } from "@/Core";
import { SearchHelper } from "@/UI/Routing";
import { provide, Location, Replace, Update, StateConfig } from "./helpers";

const searchHelper = new SearchHelper();

export const useUrlState = provide(handleUrlState);

export function handleUrlState<Data>(
  config: StateConfig<Data>,
  location: Location,
  replace: Replace,
): [Data, Update<Data>] {
  const parsedSearch = searchHelper.parse(location.search);
  const state = getKeyOrEmpty(parsedSearch, "state");
  const routeState = getKeyOrEmpty(state, config.route);
  const candidateValue = routeState[config.key];

  const parsedValue =
    typeof candidateValue !== "undefined"
      ? config.parse(candidateValue)
      : candidateValue;

  const currentValue =
    typeof parsedValue !== "undefined" ? parsedValue : config.default;

  const areEqual = (a: Data, b: Data): boolean => config.equals(a, b);

  const getSerializedValue = (value: Data) =>
    areEqual(value, config.default) ? undefined : config.serialize(value);

  const setValue = (newValue: Data) => {
    if (areEqual(newValue, currentValue)) return;
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

  return [currentValue, setValue];
}

const getKeyOrEmpty = (obj: Record<string, unknown>, key: string) => {
  const candidate = obj[key];
  return isObject(candidate) ? candidate : {};
};
