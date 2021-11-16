import { handleUrlStateWithFilter } from "./useUrlStateWithFilter";

const from = {
  search:
    "?state.Inventory.filter.timestamp[0]=from__2021-10-11T22%3A30%3A00.000Z",
  value: ["from__2021-10-11T22:30:00.000Z"],
};

const fromAndTo = {
  search:
    "?state.Inventory.filter.timestamp[0]=from__2021-10-11T22%3A30%3A00.000Z&state.Inventory.filter.timestamp[1]=to__2021-10-21T21%3A00%3A00.000Z",
  value: ["from__2021-10-11T22:30:00.000Z", "to__2021-10-21T21:00:00.000Z"],
};

test.each`
  search                                      | searchText             | expectedValue                     | valueText
  ${""}                                       | ${"empty"}             | ${{}}                             | ${"default"}
  ${"?state.Inventory.filter.action=getfact"} | ${"action=getfact"}    | ${{ action: "getfact" }}          | ${"action=getfact"}
  ${from.search}                              | ${"timestamp=from"}    | ${{ timestamp: from.value }}      | ${"timestamp=from"}
  ${fromAndTo.search}                         | ${"timestamp=from&to"} | ${{ timestamp: fromAndTo.value }} | ${"timestamp=from"}
`(
  "GIVEN handleUrlState with Filter WHEN search is $searchText THEN returns $valueText",
  async ({ search, expectedValue }) => {
    const [value] = handleUrlStateWithFilter(
      { route: "Inventory" },
      { pathname: "", search, hash: "" },
      () => undefined
    );
    expect(value).toEqual(expectedValue);
  }
);
