import moment from "moment";
import { PageSize, Query } from "@/Core";
import { DesiredStateVersionStatus } from "@S/DesiredState/Core/Domain";
import { getUrl } from "./getUrl";

it.each`
  filter                                                                                                                         | pageSize | url
  ${undefined}                                                                                                                   | ${"20"}  | ${`/api/v2/desiredstate?limit=20&sort=version.desc&filter.status=active&filter.status=candidate&filter.status=retired`}
  ${{}}                                                                                                                          | ${"10"}  | ${`/api/v2/desiredstate?limit=10&sort=version.desc&filter.status=active&filter.status=candidate&filter.status=retired`}
  ${{ status: [DesiredStateVersionStatus.active] }}                                                                              | ${"20"}  | ${`/api/v2/desiredstate?limit=20&sort=version.desc&filter.status=active`}
  ${{ version: [{ operator: "from", value: 2 }, { operator: "to", value: 42 }] }}                                                | ${"20"}  | ${`/api/v2/desiredstate?limit=20&sort=version.desc&filter.status=active&filter.status=candidate&filter.status=retired&filter.version=ge%3A2&filter.version=le%3A42`}
  ${{ date: [{ operator: "from", date: moment.tz("2021-12-06+00:30 CET", "YYYY-MM-DD+HH:mm z", "Europe/Brussels").toDate() }] }} | ${"20"}  | ${`/api/v2/desiredstate?limit=20&sort=version.desc&filter.status=active&filter.status=candidate&filter.status=retired&filter.date=ge%3A2021-12-05%2B23%3A30%3A00`}
`(
  "getUrl returns correct url for agents with filter $filter, and pageSize: $pageSize",
  ({ filter, pageSize, url }) => {
    const query: Query.SubQuery<"GetDesiredStates"> = {
      kind: "GetDesiredStates",
      pageSize: PageSize.from(pageSize),
      filter,
    };
    expect(getUrl(query, "Europe/Brussels")).toEqual(url);
  },
);
