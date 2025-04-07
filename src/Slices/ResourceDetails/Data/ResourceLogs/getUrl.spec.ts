import { PageSize, Query } from "@/Core";
import { getUrl } from "./getUrl";

it.each`
  resourceId       | filter                                                                     | filterTxt                  | pageSize | currentPage                                         | url
  ${"resourceId1"} | ${undefined}                                                               | ${"undefined"}             | ${"20"}  | ${""}                                               | ${"/api/v2/resource/resourceId1/logs?limit=20"}
  ${"resourceId1"} | ${undefined}                                                               | ${"undefined"}             | ${"50"}  | ${""}                                               | ${"/api/v2/resource/resourceId1/logs?limit=50"}
  ${"resourceId1"} | ${{ message: "failure" }}                                                  | ${"message=failure"}       | ${"20"}  | ${""}                                               | ${"/api/v2/resource/resourceId1/logs?limit=20&filter.message=failure"}
  ${"resourceId1"} | ${{ minimal_log_level: "CRITICAL" }}                                       | ${"logLevel=CRITICAL"}     | ${"20"}  | ${""}                                               | ${"/api/v2/resource/resourceId1/logs?limit=20&filter.minimal_log_level=CRITICAL"}
  ${"resourceId1"} | ${{ action: ["getfact", "deploy"] }}                                       | ${"action=getfact+deploy"} | ${"20"}  | ${""}                                               | ${"/api/v2/resource/resourceId1/logs?limit=20&filter.action=getfact&filter.action=deploy"}
  ${"resourceId1"} | ${{ timestamp: [{ operator: "from", date: "2021-01-01T11:01:01.001Z" }] }} | ${"timestamp=from+date"}   | ${"20"}  | ${""}                                               | ${"/api/v2/resource/resourceId1/logs?limit=20&filter.timestamp=ge%3A2021-01-01%2B11%3A01%3A01"}
  ${"resourceId1"} | ${{ message: "failure" }}                                                  | ${"message=failure"}       | ${"20"}  | ${"start=2023-12-13T08%3A33%3A15.180818%2B00%3A00"} | ${"/api/v2/resource/resourceId1/logs?limit=20&filter.message=failure&start=2023-12-13T08%3A33%3A15.180818%2B00%3A00"}
`(
  "getUrl returns correct url for resource logs with filter: $filterTxt, currentPage: $currentPage and pageSize: $pageSize",
  ({ resourceId, filter, pageSize, url, currentPage }) => {
    const query: Query.SubQuery<"GetResourceLogs"> = {
      kind: "GetResourceLogs",
      id: resourceId,
      pageSize: PageSize.from(pageSize),
      filter,
      currentPage: { kind: "CurrentPage", value: currentPage },
    };

    expect(getUrl(query)).toEqual(url);
  }
);
