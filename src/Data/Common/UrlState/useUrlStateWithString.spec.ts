import { renderHook } from "@testing-library/react";
import { useHandleUrlStateWithString } from "./useUrlStateWithString";

test.each`
  search                               | searchText      | expectedValue   | valueText
  ${""}                                | ${"empty"}      | ${"Info"}       | ${"default"}
  ${"?state.Inventory.tab=Attributes"} | ${"Attributes"} | ${"Attributes"} | ${"Attributes"}
`(
  "GIVEN handleUrlState with String WHEN search is $searchText THEN returns $valueText",
  async ({ search, expectedValue }) => {
    const { result } = renderHook(() =>
      useHandleUrlStateWithString(
        { default: "Info", key: "tab", route: "Inventory" },
        { pathname: "", search, hash: "" },
        () => undefined
      )
    );

    expect(result.current[0]).toEqual(expectedValue);
  }
);
