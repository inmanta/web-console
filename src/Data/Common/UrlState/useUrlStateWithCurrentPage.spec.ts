import { CurrentPage } from "@/Core";
import { handleUrlStateWithCurrentPage } from "./useUrlStateWithCurrentPage";

const currentPageVariantOne =
  "start=frontend_model%3A%3ATestResource&first_id=frontend_model%3A%3ATestResource%5Binternal%2Cname%3Ddefault-123523534623%5D%2Cv%3D20";
const currentPageVariantTwo =
  "end=lsm%3A%3ALifecycleTransfer&last_id=lsm%3A%3ALifecycleTransfer%5Binternal%2Cinstance_id%3D085cdf92-0894-4b82-8d46-1dd9552e7ba3%5D%2Cv%3D20";

test.each`
  search                                                     | searchText               | expectedValue                              | valueText
  ${""}                                                      | ${"empty"}               | ${CurrentPage.initial}                     | ${"default"}
  ${"?state.Resources.currentPage=" + currentPageVariantOne} | ${currentPageVariantOne} | ${CurrentPage.from(currentPageVariantOne)} | ${currentPageVariantTwo}
  ${"?state.Resources.currentPage=" + currentPageVariantTwo} | ${currentPageVariantTwo} | ${CurrentPage.from(currentPageVariantTwo)} | ${currentPageVariantTwo}
`(
  "GIVEN handleUrlState with PageSize WHEN search is $searchText THEN returns $valueText",
  async ({ search, expectedValue }) => {
    const [value] = handleUrlStateWithCurrentPage(
      { route: "Resources" },
      { pathname: "", search, hash: "" },
      () => undefined,
    );
    expect(value).toEqual(expectedValue);
  },
);
