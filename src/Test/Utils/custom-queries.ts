import {
  queryHelpers,
  buildQueries,
  Matcher,
  MatcherOptions,
} from "@testing-library/react";

const getMultipleError = (attrName: string) => (_c, selectorValue) =>
  `Found multiple elements with the ${attrName} attribute of: ${selectorValue}`;
const getMissingError = (attrName: string) => (_c, selectorValue) =>
  `Unable to find an element with the ${attrName} attribute of: ${selectorValue}`;

const queryAllByJointSelector = (
  container: HTMLElement,
  id: Matcher,
  options?: MatcherOptions | undefined,
) => queryHelpers.queryAllByAttribute("joint-selector", container, id, options);

const [
  queryByJointSelector,
  getAllByJointSelector,
  getByJointSelector,
  findAllByJointSelector,
  findByJointSelector,
] = buildQueries(
  queryAllByJointSelector,
  getMultipleError("joint-selector"),
  getMissingError("joint-selector"),
);

export {
  queryByJointSelector,
  queryAllByJointSelector,
  getByJointSelector,
  getAllByJointSelector,
  findAllByJointSelector,
  findByJointSelector,
};
