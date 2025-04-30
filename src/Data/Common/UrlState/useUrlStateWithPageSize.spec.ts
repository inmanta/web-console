import { PageSize } from "@/Core";
import { handleUrlStateWithPageSize } from "./useUrlStateWithPageSize";

test.each`
  route                | search                            | expectedValue           | valueText
  ${"Inventory"}       | ${""}                             | ${PageSize.initial}     | ${"default"}
  ${"Inventory"}       | ${"?state.Inventory.pageSize=10"} | ${PageSize.from("10")}  | ${"10"}
  ${"ResourceDetails"} | ${""}                             | ${PageSize.from("100")} | ${"100"}
  ${"Resources"}       | ${""}                             | ${PageSize.from("100")} | ${"100"}
`(
  "GIVEN handleUrlState with PageSize WHEN route is $route and search is $search THEN returns $valueText",
  async ({ route, search, expectedValue }) => {
    const [value] = handleUrlStateWithPageSize(
      { route },
      { pathname: "", search, hash: "" },
      () => undefined
    );

    expect(value).toEqual(expectedValue);
  }
);
