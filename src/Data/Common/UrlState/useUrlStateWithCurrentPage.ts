import { isEqual, isArray } from "lodash";
import { provide, Location, Replace, StateConfig, Update } from "./helpers";
import { handleUrlState } from "./useUrlState";

export const useUrlStateWithCurrentPage = provide(
  handleUrlStateWithCurrentPage,
);
const valueIsValid = (value: unknown): value is string[] => {
  return isArray(value) && value.every((param) => typeof param === "string");
};

const from = (value: string[]): CurrentPage => {
  return { kind: "CurrentPage", value: valueIsValid(value) ? value : [] };
};
const serialize = (currentPage: CurrentPage): string[] => {
  return currentPage.value;
};

const parse = (candidate: unknown): CurrentPage | undefined => {
  return valueIsValid(candidate) ? from(candidate) : undefined;
};

export interface CurrentPage {
  kind: "CurrentPage";
  value: string[];
}

export function handleUrlStateWithCurrentPage(
  config: Pick<StateConfig<CurrentPage>, "route">,
  location: Location,
  replace: Replace,
): [CurrentPage, Update<CurrentPage>] {
  return handleUrlState<CurrentPage>(
    {
      default: initialCurrentPage,
      key: "currentPage",
      route: config.route,
      serialize: serialize,
      parse: parse,
      equals: (a, b) => isEqual(a, b),
    },
    location,
    replace,
  );
}

export const initialCurrentPage: CurrentPage = {
  kind: "CurrentPage",
  value: [],
};
