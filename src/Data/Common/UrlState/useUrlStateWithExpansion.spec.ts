import { handleUrlStateWithExpansion } from "./useUrlStateWithExpansion";

test.each`
  search                                                                    | searchText   | expectedValue       | valueText
  ${""}                                                                     | ${"empty"}   | ${[]}               | ${"default"}
  ${"?state.Inventory.expansion[0]=abcd"}                                   | ${"1 item"}  | ${["abcd"]}         | ${"1 item"}
  ${"?state.Inventory.expansion[0]=abcd&state.Inventory.expansion[1]=efgh"} | ${"2 items"} | ${["abcd", "efgh"]} | ${"2 items"}
`(
  "GIVEN handleUrlState with Expansion WHEN search is $searchText THEN returns $valueText",
  async ({ search, expectedValue }) => {
    const [value] = handleUrlStateWithExpansion(
      { route: "Inventory" },
      { pathname: "", search, hash: "" },
      () => undefined,
    );
    expect(value).toEqual(expectedValue);
  },
);
