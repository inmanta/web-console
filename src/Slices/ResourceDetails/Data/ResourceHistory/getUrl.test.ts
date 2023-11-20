import { PageSize, Query } from "@/Core";
import { getUrl } from "./getUrl";

it.each`
  resourceId       | sort                               | sortTxt        | pageSize | url
  ${"resourceId1"} | ${undefined}                       | ${"undefined"} | ${"20"}  | ${`/api/v2/resource/resourceId1/history?limit=20`}
  ${"resourceId1"} | ${undefined}                       | ${"undefined"} | ${"100"} | ${`/api/v2/resource/resourceId1/history?limit=100`}
  ${"resourceId1"} | ${{ name: "date", order: "asc" }}  | ${"date.asc"}  | ${"100"} | ${`/api/v2/resource/resourceId1/history?limit=100&sort=date.asc`}
  ${"resourceId1"} | ${{ name: "date", order: "desc" }} | ${"date.desc"} | ${"20"}  | ${`/api/v2/resource/resourceId1/history?limit=20&sort=date.desc`}
`(
  "getUrl returns correct url for resource history with sort: $sortTxt and pageSize: $pageSize",
  ({ resourceId, sort, pageSize, url }) => {
    const query: Query.SubQuery<"GetResourceHistory"> = {
      kind: "GetResourceHistory",
      id: resourceId,
      pageSize: PageSize.from(pageSize),
      sort,
      currentPage: { kind: "CurrentPage", value: [] },
    };
    expect(getUrl(query)).toEqual(url);
  },
);
