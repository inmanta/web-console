import { PageSize, Query } from "@/Core";
import { getUrl } from "./getUrl";

it.each`
  filter                                                                     | filterTxt                  | pageSize | url
  ${undefined}                                                               | ${"undefined"}             | ${"20"}  | ${`/api/v2/resource/resourceId1/logs?limit=20`}
  ${undefined}                                                               | ${"undefined"}             | ${"10"}  | ${`/api/v2/resource/resourceId1/logs?limit=10`}
  ${{ message: "failure" }}                                                  | ${"message=failure"}       | ${"20"}  | ${`/api/v2/resource/resourceId1/logs?limit=20&filter.message=failure`}
  ${{ minimal_log_level: "CRITICAL" }}                                       | ${"logLevel=CRITICAL"}     | ${"20"}  | ${`/api/v2/resource/resourceId1/logs?limit=20&filter.minimal_log_level=CRITICAL`}
  ${{ action: ["getfact", "deploy"] }}                                       | ${"action=getfact+deploy"} | ${"20"}  | ${`/api/v2/resource/resourceId1/logs?limit=20&filter.action=getfact&filter.action=deploy`}
  ${{ timestamp: [{ operator: "from", date: "2021-01-01T11:01:01.001Z" }] }} | ${"timestamp=from+date"}   | ${"20"}  | ${`/api/v2/resource/resourceId1/logs?limit=20&filter.timestamp=ge%3A2021-01-01%2B11%3A01%3A01`}
`(
  "getUrl returns correct url for resource logs with filter: $filterTxt and pageSize: $pageSize",
  ({ filter, pageSize, url }) => {
    const query: Query.SubQuery<"GetResourceLogs"> = {
      kind: "GetResourceLogs",
      id: "resourceId1",
      pageSize: PageSize.from(pageSize),
      filter,
    };
    expect(getUrl(query)).toEqual(url);
  }
);
