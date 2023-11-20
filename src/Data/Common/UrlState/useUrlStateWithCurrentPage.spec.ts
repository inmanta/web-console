import { handleUrlStateWithCurrentPage } from "./useUrlStateWithCurrentPage";

const startParameter = decodeURIComponent(
  "start=frontend_model%3A%3ATestResource",
);
const firstIdParameter = decodeURIComponent(
  "first_id=frontend_model%3A%3ATestResource%5Binternal%2Cname%3Ddefault-123523534623%5D%2Cv%3D20",
);
const endParameter = decodeURIComponent("end=lsm%3A%3ALifecycleTransfer");
const lastIdParameter = decodeURIComponent(
  "last_id=lsm%3A%3ALifecycleTransfer%5Binternal%2Cinstance_id%3D085cdf92-0894-4b82-8d46-1dd9552e7ba3%5D%2Cv%3D20",
);

test.each`
  search                                                                                                         | searchText                         | expectedValue                         | valueText
  ${""}                                                                                                          | ${"empty"}                         | ${[]}                                 | ${"[]"}
  ${"?state.Resources.currentPage[0]=" + startParameter + "&state.Resources.currentPage[1]=" + firstIdParameter} | ${[endParameter, lastIdParameter]} | ${[startParameter, firstIdParameter]} | ${[endParameter, lastIdParameter]}
  ${"?state.Resources.currentPage[0]=" + endParameter + "&state.Resources.currentPage[1]=" + lastIdParameter}    | ${[endParameter, lastIdParameter]} | ${[endParameter, lastIdParameter]}    | ${[endParameter, lastIdParameter]}
`(
  "GIVEN handleUrlState with PageSize WHEN search is $searchText THEN returns $valueText",
  async ({ search, expectedValue }) => {
    const [value] = handleUrlStateWithCurrentPage(
      { route: "Resources" },
      { pathname: "", search, hash: "" },
      () => undefined,
    );
    expect(value).toEqual({
      kind: "CurrentPage",
      value: expectedValue,
    });
  },
);
