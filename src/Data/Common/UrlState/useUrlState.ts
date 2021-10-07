import { useHistory, useLocation } from "react-router-dom";

import { isObject } from "@/Core";
import { Kind, SearchHelper } from "@/UI/Routing";

const searchHelper = new SearchHelper();

export interface StateConfig<Data> {
  default: Data;
  key: string;
  route: Kind;
  validator: Validator<Data>;
  serialize?: (data: Data) => string;
  parse?: (value: string) => Data | null;
  equals?: (a: Data, b: Data) => boolean;
}

type Validator<Data> = (value: unknown) => value is Data;

type Update<Data> = (data: Data) => void;

export interface Location {
  pathname: string;
  search: string;
  hash: string;
}

export interface History {
  replace(to: string): void;
}

export function useUrlState<Data>(
  config: StateConfig<Data>
): [Data, Update<Data>] {
  const location = useLocation();
  const history = useHistory();
  return handleUrlState(config, location, history);
}

export function handleUrlState<Data>(
  config: StateConfig<Data>,
  location: Location,
  history: History
): [Data, Update<Data>] {
  const parsedSearch = searchHelper.parse(location.search);
  const state = getKeyOrEmpty(parsedSearch, "state");
  const routeState = getKeyOrEmpty(state, config.route);
  const candidateValue = routeState[config.key];

  const parsed =
    config.parse && typeof candidateValue !== "undefined"
      ? config.parse(candidateValue as string)
      : candidateValue;
  const currentValue = config.validator(parsed) ? parsed : config.default;

  const areEqual = (a: Data, b: Data): boolean => {
    if (config.equals) {
      return config.equals(a, b);
    }
    return a === b;
  };

  const setValue = (newValue: Data) => {
    if (areEqual(newValue, currentValue)) return;

    const correctValue = areEqual(newValue, config.default)
      ? undefined
      : config.serialize
      ? config.serialize(newValue)
      : newValue;

    const newSearch = searchHelper.stringify({
      ...parsedSearch,
      state: {
        ...state,
        [config.route]: {
          ...routeState,
          [config.key]: correctValue,
        },
      },
    });

    history.replace(`${location.pathname}${newSearch}${location.hash}`);
  };
  return [currentValue, setValue];
}

const getKeyOrEmpty = (obj: Record<string, unknown>, key: string) => {
  const candidate = obj[key];
  return isObject(candidate) ? candidate : {};
};
