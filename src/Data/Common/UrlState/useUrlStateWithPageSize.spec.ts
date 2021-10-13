import { getMockedLocation, mockedHistory } from "./helpers.mocked";
import { PageSize } from "@/Core";
import { handleUrlStateWithPageSize } from "@/Data";

test.each`
  search                            | searchText | expectedValue          | valueText
  ${""}                             | ${"empty"} | ${PageSize.initial}    | ${"default"}
  ${"?state.Inventory.pageSize=10"} | ${"10"}    | ${PageSize.from("10")} | ${"10"}
`(
  "GIVEN handleUrlState with PageSize WHEN search is $searchText THEN returns $valueText",
  async ({ search, expectedValue }) => {
    const [value] = handleUrlStateWithPageSize(
      { route: "Inventory" },
      getMockedLocation(search),
      mockedHistory
    );
    expect(value).toEqual(expectedValue);
  }
);
