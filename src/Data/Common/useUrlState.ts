import { useHistory, useLocation } from "react-router-dom";
import { UrlHelper } from "./UrlHelper";
import { isObject } from "@/Core";
import { Kinds } from "@/UI";

const urlHelper = new UrlHelper();

export interface StateConfig<Data> {
  default: Data;
  key: string;
  route: Kinds;
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
  const parsedSearch = parseSearch(location.search);
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

    console.log("setValue", config.key, {
      newValue,
      default: config.default,
      equal: areEqual(newValue, config.default),
    });
    const correctValue = areEqual(newValue, config.default)
      ? undefined
      : config.serialize
      ? config.serialize(newValue)
      : newValue;

    history.replace(
      `${location.pathname}${getSearchFromState(
        {
          ...state,
          [config.route]: {
            ...routeState,
            [config.key]: correctValue,
          },
        },
        parsedSearch
      )}${location.hash}`
    );
  };
  return [currentValue, setValue];
}

const getSearchFromState = (
  state: Record<string, unknown>,
  search: Record<string, unknown>
): string => {
  return `?${urlHelper.stringify({ ...search, state })}`;
};

const parseSearch = (search: string) => {
  const sanitizedSearch = urlHelper.sanitize(search);
  return urlHelper.parse(sanitizedSearch);
};

const getKeyOrEmpty = (obj: Record<string, unknown>, key: string) => {
  const candidate = obj[key];
  return isObject(candidate) ? candidate : {};
};
