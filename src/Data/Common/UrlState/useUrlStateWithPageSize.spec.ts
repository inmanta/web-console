import { renderHook } from "@testing-library/react";
import { PageSize } from "@/Core";
import { useHandleUrlStateWithPageSize } from "./useUrlStateWithPageSize";

test.each`
  route                | search                            | expectedValue           | valueText
  ${"Inventory"}       | ${""}                             | ${PageSize.initial}     | ${"default"}
  ${"Inventory"}       | ${"?state.Inventory.pageSize=10"} | ${PageSize.from("10")}  | ${"10"}
  ${"ResourceDetails"} | ${""}                             | ${PageSize.from("100")} | ${"100"}
  ${"Resources"}       | ${""}                             | ${PageSize.from("100")} | ${"100"}
`(
  "GIVEN handleUrlState with PageSize WHEN route is $route and search is $search THEN returns $valueText",
  async ({ route, search, expectedValue }) => {
    const { result } = renderHook(() =>
      useHandleUrlStateWithPageSize({ route }, { pathname: "", search, hash: "" }, () => undefined)
    );

    expect(result.current[0]).toEqual(expectedValue);
  }
);
