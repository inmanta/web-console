import moment from "moment";
import { PageSize, Query } from "@/Core";
import { getUrl } from "./getUrl";

it.each`
  filter                                                                                                                            | sort                                  | pageSize | url
  ${undefined}                                                                                                                      | ${undefined}                          | ${"20"}  | ${`/api/v2/parameters?limit=20`}
  ${{}}                                                                                                                             | ${{ name: "name", order: "asc" }}     | ${"10"}  | ${`/api/v2/parameters?limit=10&sort=name.asc`}
  ${{ name: ["abcd"] }}                                                                                                             | ${{ name: "name", order: "desc" }}    | ${"10"}  | ${`/api/v2/parameters?limit=10&sort=name.desc&filter.name=abcd`}
  ${{ source: ["plugin"], name: ["xyz"] }}                                                                                          | ${{ name: "source", order: "asc" }}   | ${"20"}  | ${`/api/v2/parameters?limit=20&sort=source.asc&filter.name=xyz&filter.source=plugin`}
  ${{ updated: [{ operator: "from", date: moment.tz("2022-01-31+00:30 CET", "YYYY-MM-DD+HH:mm z", "Europe/Brussels").toDate() }] }} | ${{ name: "updated", order: "desc" }} | ${"20"}  | ${`/api/v2/parameters?limit=20&sort=updated.desc&filter.updated=ge%3A2022-01-30%2B23%3A30%3A00`}
`(
  "getUrl returns correct url for agents with filter $filter, and pageSize: $pageSize",
  ({ filter, pageSize, sort, url }) => {
    const query: Query.SubQuery<"GetParameters"> = {
      kind: "GetParameters",
      pageSize: PageSize.from(pageSize),
      filter,
      sort,
    };
    expect(getUrl(query, "Europe/Brussels")).toEqual(url);
  },
);
