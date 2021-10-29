import { PrimaryBaseUrlManager } from "./PrimaryBaseUrlManager";

test.each`
  fullUrl                         | returnText                      | returnValue
  ${""}                           | ${"/console"}                   | ${"/console"}
  ${"/"}                          | ${"/console"}                   | ${"/console"}
  ${"/sub1"}                      | ${"/console"}                   | ${"/console"}
  ${"/console/something"}         | ${"/console"}                   | ${"/console"}
  ${"/something/console"}         | ${"/something/console"}         | ${"/something/console"}
  ${"/something/andmore/console"} | ${"/something/andmore/console"} | ${"/something/andmore/console"}
  ${"/something/console/wrong"}   | ${"/something/console"}         | ${"/something/console"}
`(
  "GIVEN BaseUrlFinder WHEN url = $fullUrl THEN returns $returnText",
  ({ fullUrl, returnValue }) => {
    expect(new PrimaryBaseUrlManager(fullUrl).getConsoleBaseUrl()).toEqual(
      returnValue
    );
  }
);

test.each`
  fullUrl                         | returnText              | returnValue
  ${""}                           | ${""}                   | ${""}
  ${"/"}                          | ${""}                   | ${""}
  ${"/sub1"}                      | ${""}                   | ${""}
  ${"/console/something"}         | ${""}                   | ${""}
  ${"/something/console"}         | ${"/something"}         | ${"/something"}
  ${"/something/andmore/console"} | ${"/something/andmore"} | ${"/something/andmore"}
  ${"/something/console/wrong"}   | ${"/something"}         | ${"/something"}
`(
  "GIVEN BaseUrlFinder WHEN url = $fullUrl THEN returns $returnText",
  ({ fullUrl, returnValue }) => {
    expect(new PrimaryBaseUrlManager(fullUrl).getBaseUrl()).toEqual(
      returnValue
    );
  }
);
