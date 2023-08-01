import { PrimaryBaseUrlManager } from "./PrimaryBaseUrlManager";

test.each`
  origin                       | pathname                        | basePathname
  ${""}                        | ${""}                           | ${"/console"}
  ${""}                        | ${"/"}                          | ${"/console"}
  ${""}                        | ${"/sub1"}                      | ${"/console"}
  ${""}                        | ${"/console/something"}         | ${"/console"}
  ${""}                        | ${"/something/console"}         | ${"/something/console"}
  ${""}                        | ${"/something/andmore/console"} | ${"/something/andmore/console"}
  ${"http://example.com:8888"} | ${""}                           | ${"/console"}
  ${"http://example.com:8888"} | ${"/console/something"}         | ${"/console"}
  ${"http://example.com:8888"} | ${"/something/console"}         | ${"/something/console"}
`(
  "GIVEN BaseUrlFinder.getBasePathname WHEN ($origin,$pathname) THEN returns $returnText",
  ({ origin, pathname, basePathname }) => {
    expect(
      new PrimaryBaseUrlManager(origin, pathname).getBasePathname(),
    ).toEqual(basePathname);
  },
);

test.each`
  origin                       | pathname                        | baseUrl
  ${""}                        | ${""}                           | ${""}
  ${""}                        | ${"/"}                          | ${""}
  ${""}                        | ${"/sub1"}                      | ${""}
  ${""}                        | ${"/console/something"}         | ${""}
  ${""}                        | ${"/something/console"}         | ${"/something"}
  ${""}                        | ${"/something/andmore/console"} | ${"/something/andmore"}
  ${""}                        | ${"/something/console/after"}   | ${"/something"}
  ${"http://example.com:8888"} | ${""}                           | ${"http://example.com:8888"}
  ${"http://example.com:8888"} | ${"/"}                          | ${"http://example.com:8888"}
  ${"http://example.com:8888"} | ${"/sub1"}                      | ${"http://example.com:8888"}
  ${"http://example.com:8888"} | ${"/console/something"}         | ${"http://example.com:8888"}
  ${"http://example.com:8888"} | ${"/something/console"}         | ${"http://example.com:8888/something"}
  ${"http://example.com:8888"} | ${"/something/andmore/console"} | ${"http://example.com:8888/something/andmore"}
  ${"http://example.com:8888"} | ${"/something/console/after"}   | ${"http://example.com:8888/something"}
`(
  "GIVEN BaseUrlFinder WHEN url = $fullUrl THEN returns $returnText",
  ({ origin, pathname, baseUrl }) => {
    expect(new PrimaryBaseUrlManager(origin, pathname).getBaseUrl()).toEqual(
      baseUrl,
    );
  },
);
