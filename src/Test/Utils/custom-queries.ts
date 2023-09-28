import {
  queryHelpers,
  buildQueries,
  Matcher,
  MatcherOptions,
} from "@testing-library/react";

const queryAllByJointSelector = (
  container: HTMLElement,
  id: Matcher,
  options?: MatcherOptions | undefined,
) => queryHelpers.queryAllByAttribute("joint-selector", container, id, options);

const getMultipleError = (_c, jointSelectorValue) =>
  `Found multiple elements with the joint-selector attribute of: ${jointSelectorValue}`;
const getMissingError = (_c, jointSelectorValue) =>
  `Unable to find an element with the joint-selector attribute of: ${jointSelectorValue}`;

const [
  queryByJointSelector,
  getAllByJointSelector,
  getByJointSelector,
  findAllByJointSelector,
  findByJointSelector,
] = buildQueries(queryAllByJointSelector, getMultipleError, getMissingError);

export {
  queryByJointSelector,
  queryAllByJointSelector,
  getByJointSelector,
  getAllByJointSelector,
  findAllByJointSelector,
  findByJointSelector,
};
