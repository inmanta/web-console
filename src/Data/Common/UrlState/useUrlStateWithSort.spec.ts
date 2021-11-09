import { getMockedLocation, mockedHistory } from "./helpers.mocked";
import { handleUrlStateWithSort } from "./useUrlStateWithSort";

test.each`
  search                                | searchText      | expectedValue                           | valueText
  ${""}                                 | ${"empty"}      | ${{ name: "timestamp", order: "desc" }} | ${"default"}
  ${"?state.Inventory.sort=action.asc"} | ${"action.asc"} | ${{ name: "action", order: "asc" }}     | ${"action.asc"}
`(
  "GIVEN handleUrlState with Sort WHEN search is $searchText THEN returns $valueText",
  async ({ search, expectedValue }) => {
    const [value] = handleUrlStateWithSort(
      { default: { name: "timestamp", order: "desc" }, route: "Inventory" },
      getMockedLocation(search),
      mockedHistory
    );
    expect(value).toEqual(expectedValue);
  }
);
