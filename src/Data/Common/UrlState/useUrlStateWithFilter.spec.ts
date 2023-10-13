import moment from "moment";
import { handleUrlStateWithFilter } from "./useUrlStateWithFilter";

const fromDate = {
  search:
    "?state.Inventory.filter.timestamp[0]=from__2021-10-11T22%3A30%3A00.000Z",
  value: [
    { operator: "from", date: moment("2021-10-11T22:30:00.000Z").toDate() },
  ],
};

const fromAndToDate = {
  search:
    "?state.Inventory.filter.timestamp[0]=from__2021-10-11T22%3A30%3A00.000Z&state.Inventory.filter.timestamp[1]=to__2021-10-21T21%3A00%3A00.000Z",
  value: [
    { operator: "from", date: moment("2021-10-11T22:30:00.000Z").toDate() },
    { operator: "to", date: moment("2021-10-21T21:00:00.000Z").toDate() },
  ],
};

const fromInt = {
  search: "?state.Inventory.filter.version[0]=from__10",
  value: [{ operator: "from", value: 10 }],
};

const fromAndToInt = {
  search:
    "?state.Inventory.filter.version[0]=from__10&state.Inventory.filter.version[1]=to__20",
  value: [
    { operator: "from", value: 10 },
    { operator: "to", value: 20 },
  ],
};

test.each`
  search                                                                        | searchText                     | expectedValue                         | valueText
  ${""}                                                                         | ${"empty"}                     | ${{}}                                 | ${"default"}
  ${"?state.Inventory.filter.action=getfact"}                                   | ${"action=getfact"}            | ${{ action: "getfact" }}              | ${"action=getfact"}
  ${fromDate.search}                                                            | ${"timestamp=from"}            | ${{ timestamp: fromDate.value }}      | ${"timestamp=from"}
  ${fromAndToDate.search}                                                       | ${"timestamp=from&to"}         | ${{ timestamp: fromAndToDate.value }} | ${"timestamp=from&to"}
  ${fromInt.search}                                                             | ${"version=from"}              | ${{ version: fromInt.value }}         | ${"version=from"}
  ${fromAndToInt.search}                                                        | ${"version=from&to"}           | ${{ version: fromAndToInt.value }}    | ${"version=from&to"}
  ${"?state.Inventory.filter.success=false"}                                    | ${"success=false"}             | ${{ success: false }}                 | ${"success=false"}
  ${"?state.Inventory.filter.success=true"}                                     | ${"success=true"}              | ${{ success: true }}                  | ${"success=true"}
  ${"?state.Inventory.filter.success=true&state.Inventory.filter.details=true"} | ${"success=true&details=true"} | ${{ success: true, details: true }}   | ${"success=true&details=true"}
`(
  "GIVEN handleUrlState with Filter WHEN search is $searchText THEN returns $valueText",
  async ({ search, expectedValue }) => {
    const [value] = handleUrlStateWithFilter(
      {
        route: "Inventory",
        keys: {
          timestamp: "DateRange",
          version: "IntRange",
          success: "Boolean",
          details: "Boolean",
        },
      },
      { pathname: "", search, hash: "" },
      () => undefined,
    );
    expect(value).toEqual(expectedValue);
  },
);
