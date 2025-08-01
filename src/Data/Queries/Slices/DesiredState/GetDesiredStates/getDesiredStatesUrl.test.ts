import moment from "moment-timezone";
import { PageSize } from "@/Core";
import { DesiredStateVersionStatus } from "@S/DesiredState/Core/Domain";
import { getDesiredStatesUrl } from "./getDesiredStatesUrl";
import { GetDesiredStatesParams } from "./useGetDesiredStates";

it.each`
  filter                                                                                                                         | pageSize | currentPage                                                  | url
  ${undefined}                                                                                                                   | ${"20"}  | ${""}                                                        | ${"/api/v2/desiredstate?limit=20&sort=version.desc"}
  ${{}}                                                                                                                          | ${"50"}  | ${""}                                                        | ${"/api/v2/desiredstate?limit=50&sort=version.desc"}
  ${{ status: [DesiredStateVersionStatus.active] }}                                                                              | ${"20"}  | ${""}                                                        | ${"/api/v2/desiredstate?limit=20&sort=version.desc&filter.status=active"}
  ${{ version: [{ operator: "from", value: 2 }, { operator: "to", value: 42 }] }}                                                | ${"20"}  | ${""}                                                        | ${"/api/v2/desiredstate?limit=20&sort=version.desc&filter.version=ge%3A2&filter.version=le%3A42"}
  ${{ date: [{ operator: "from", date: moment.tz("2021-12-06+00:30 CET", "YYYY-MM-DD+HH:mm z", "Europe/Brussels").toDate() }] }} | ${"20"}  | ${""}                                                        | ${"/api/v2/desiredstate?limit=20&sort=version.desc&filter.date=ge%3A2021-12-05%2B23%3A30%3A00"}
  ${{ status: [DesiredStateVersionStatus.active] }}                                                                              | ${"20"}  | ${"end=%3D2023-12-13T08%253A33%253A15.192674%252B00%253A00"} | ${"/api/v2/desiredstate?limit=20&sort=version.desc&filter.status=active&end=%3D2023-12-13T08%253A33%253A15.192674%252B00%253A00"}
  ${{ status: [DesiredStateVersionStatus.active] }}                                                                              | ${"20"}  | ${"start=2023-12-13T08%3A33%3A15.180818%2B00%3A00"}          | ${"/api/v2/desiredstate?limit=20&sort=version.desc&filter.status=active&start=2023-12-13T08%3A33%3A15.180818%2B00%3A00"}
`(
  "getUrl returns correct url for agents with filter $filter, currentPage: $currentPage and pageSize: $pageSize",
  ({ filter, pageSize, url, currentPage }) => {
    const query: GetDesiredStatesParams = {
      pageSize: PageSize.from(pageSize),
      filter,
      currentPage: { kind: "CurrentPage", value: currentPage },
    };

    expect(getDesiredStatesUrl(query, "Europe/Brussels")).toEqual(url);
  }
);
