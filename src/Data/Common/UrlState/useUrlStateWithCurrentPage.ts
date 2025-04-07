import { isEqual, isArray } from "lodash";
import { provide, Location, Replace, StateConfig, Update } from "./helpers";
import { handleUrlState } from "./useUrlState";

/**
 * Hook that wrap handleUrlStateWithCurrentPage function in provider that feeds function with the useLocation() useNavigation() functions,
 * to simplify reusage of said function
 */
export const useUrlStateWithCurrentPage = provide(
  handleUrlStateWithCurrentPage,
);

/**
 * Checks whether the value passed is an Array of strings.
 * @returns boolean
 */
const valueIsValid = (value: unknown): value is string[] => {
  return isArray(value) && value.every((param) => typeof param === "string");
};

const from = (value: string[]): CurrentPage => {
  return {
    kind: "CurrentPage",
    value: valueIsValid(value) ? value.join("&") : "",
  };
};
const serialize = (currentPage: CurrentPage): string[] => {
  return currentPage.value.split("&");
};

const parse = (candidate: unknown): CurrentPage | undefined => {
  return valueIsValid(candidate) ? from(candidate) : undefined;
};

export interface CurrentPage {
  kind: "CurrentPage";
  value: string;
}

/**
 * Function that keep track of current Page in paginated views by storing parameters dictating range of showed entries
 * It's used across all Views that serve paginated data
 *
 * @param config object responsible of dictating path for the state in the web url
 * @param location reactRouter location object
 * @param replace function based on reactRouter navigate() to change/update url
 * @returns main handleUrlState instance set up for given configuration
 */
export function handleUrlStateWithCurrentPage (
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
  value: "",
};
