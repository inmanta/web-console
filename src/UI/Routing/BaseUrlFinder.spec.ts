import { Maybe } from "@/Core";
import { BaseUrlFinder } from "./BaseUrlFinder";

const finder = new BaseUrlFinder();

test.each`
  fullUrl                                                         | returnText                         | returnValue
  ${""}                                                           | ${"Maybe.none()"}                  | ${Maybe.none()}
  ${"/"}                                                          | ${"Maybe.none()"}                  | ${Maybe.none()}
  ${"/sub1"}                                                      | ${"Maybe.none()"}                  | ${Maybe.none()}
  ${"/sub1/"}                                                     | ${"Maybe.none()"}                  | ${Maybe.none()}
  ${"/sub1/lsm/catalog"}                                          | ${"Maybe.some('/sub1')"}           | ${Maybe.some("/sub1")}
  ${"/sub1/lsm/catalog"}                                          | ${"Maybe.some('/sub1')"}           | ${Maybe.some("/sub1")}
  ${"/sub1/lsm/catalog/cloudconnect/inventory"}                   | ${"Maybe.some('/sub1')"}           | ${Maybe.some("/sub1")}
  ${"/sub1/lsm/catalog/cloudconnect/inventory/add"}               | ${"Maybe.some('/sub1')"}           | ${Maybe.some("/sub1")}
  ${"/sub1/lsm/catalog/cloudconnect/inventory/abcd1234/history"}  | ${"Maybe.some('/sub1')"}           | ${Maybe.some("/sub1")}
  ${"/sub1/lsm/catalog/cloudconnect/inventory/abcd1234/diagnose"} | ${"Maybe.some('/sub1')"}           | ${Maybe.some("/sub1")}
  ${"/sub1/lsm/catalog/cloudconnect/inventory/abcd1234/events"}   | ${"Maybe.some('/sub1')"}           | ${Maybe.some("/sub1")}
  ${"/sub1/resources"}                                            | ${"Maybe.some('/sub1')"}           | ${Maybe.some("/sub1")}
  ${"/sub1/sub2/lsm/catalog"}                                     | ${"Maybe.some('/sub1/sub2')"}      | ${Maybe.some("/sub1/sub2")}
  ${"/sub1/sub2/sub3/lsm/catalog"}                                | ${"Maybe.some('/sub1/sub2/sub3')"} | ${Maybe.some("/sub1/sub2/sub3")}
`(
  "GIVEN BaseUrlFinder WHEN find('$fullUrl') THEN returns $returnText",
  ({ fullUrl, returnValue }) => {
    expect(finder.find(fullUrl)).toMatchObject(returnValue);
  }
);

test("GIVEN BaseUrlFinder WHEN getPaths THEN returns paths with wildcard", () => {
  expect(finder.getPaths()).toEqual([
    "*/lsm/catalog",
    "*/lsm/catalog/:service/inventory",
    "*/lsm/catalog/:service/inventory/add",
    "*/lsm/catalog/:service/inventory/:instance/edit",
    "*/lsm/catalog/:service/inventory/:instance/history",
    "*/lsm/catalog/:service/inventory/:instance/diagnose",
    "*/lsm/catalog/:service/inventory/:instance/events",
    "*/resources",
    "*/resources/:resourceId/history",
    "*/resources/:resourceId/logs",
    "*/compilereports",
    "*/compilereports/:id",
  ]);
});
