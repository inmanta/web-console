import { handleUrlStateWithString } from "./useUrlStateWithString";

test.each`
  search                               | searchText      | expectedValue   | valueText
  ${""}                                | ${"empty"}      | ${"Info"}       | ${"default"}
  ${"?state.Inventory.tab=Attributes"} | ${"Attributes"} | ${"Attributes"} | ${"Attributes"}
`(
  "GIVEN handleUrlState with String WHEN search is $searchText THEN returns $valueText",
  async ({ search, expectedValue }) => {
    const [value] = handleUrlStateWithString(
      { default: "Info", key: "tab", route: "Inventory" },
      { pathname: "", search, hash: "" },
      () => undefined,
    );
    expect(value).toEqual(expectedValue);
  },
);
