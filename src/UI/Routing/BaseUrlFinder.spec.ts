import { BaseUrlFinder } from "./BaseUrlFinder";

const finder = new BaseUrlFinder();

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
    expect(finder.getUrl(fullUrl)).toEqual(returnValue);
  }
);
