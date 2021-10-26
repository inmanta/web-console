import { PageSize, Query } from "@/Core";
import { getUrl } from "./getUrl";

it.each`
  sort                               | sortTxt        | pageSize | url
  ${undefined}                       | ${"undefined"} | ${"20"}  | ${`/api/v2/resource/resourceId1/history?limit=20`}
  ${undefined}                       | ${"undefined"} | ${"10"}  | ${`/api/v2/resource/resourceId1/history?limit=10`}
  ${{ name: "date", order: "asc" }}  | ${"date.asc"}  | ${"10"}  | ${`/api/v2/resource/resourceId1/history?limit=10&sort=date.asc`}
  ${{ name: "date", order: "desc" }} | ${"date.desc"} | ${"20"}  | ${`/api/v2/resource/resourceId1/history?limit=20&sort=date.desc`}
`(
  "getUrl returns correct url for resource history with sort: $sortTxt and pageSize: $pageSize",
  ({ sort, pageSize, url }) => {
    const query: Query.SubQuery<"GetResourceHistory"> = {
      kind: "GetResourceHistory",
      id: "resourceId1",
      pageSize: PageSize.from(pageSize),
      sort,
    };
    expect(getUrl(query)).toEqual(url);
  }
);
