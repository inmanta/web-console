import { renderHook } from "@testing-library/react";
import { useHandleUrlStateWithExpansion } from "./useUrlStateWithExpansion";

test.each`
  search                                                                    | searchText   | expectedValue       | valueText
  ${""}                                                                     | ${"empty"}   | ${[]}               | ${"default"}
  ${"?state.Inventory.expansion[0]=abcd"}                                   | ${"1 item"}  | ${["abcd"]}         | ${"1 item"}
  ${"?state.Inventory.expansion[0]=abcd&state.Inventory.expansion[1]=efgh"} | ${"2 items"} | ${["abcd", "efgh"]} | ${"2 items"}
`(
  "GIVEN handleUrlState with Expansion WHEN search is $searchText THEN returns $valueText",
  async ({ search, expectedValue }) => {
    const { result } = renderHook(() =>
      useHandleUrlStateWithExpansion(
        { route: "Inventory" },
        { pathname: "", search, hash: "" },
        () => undefined
      )
    );

    expect(result.current[0]).toEqual(expectedValue);
  }
);
