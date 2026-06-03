import { renderHook } from "@testing-library/react";
import { useUrlStateWithSortHandler } from "./useUrlStateWithSort";

test.each`
  search                                | searchText      | expectedValue                           | valueText
  ${""}                                 | ${"empty"}      | ${{ name: "timestamp", order: "desc" }} | ${"default"}
  ${"?state.Inventory.sort=action.asc"} | ${"action.asc"} | ${{ name: "action", order: "asc" }}     | ${"action.asc"}
`(
  "GIVEN handleUrlState with Sort WHEN search is $searchText THEN returns $valueText",
  async ({ search, expectedValue }) => {
    const { result } = renderHook(() =>
      useUrlStateWithSortHandler(
        { default: { name: "timestamp", order: "desc" }, route: "Inventory" },
        { pathname: "", search, hash: "" },
        () => undefined
      )
    );

    expect(result.current[0]).toEqual(expectedValue);
  }
);
