import { PageSize, Query } from "@/Core";
import { getUrl } from "./getUrl";

it.each`
  resourceId       | sort                               | sortTxt        | pageSize | currentPage                                         | url
  ${"resourceId1"} | ${undefined}                       | ${"undefined"} | ${"20"}  | ${""}                                               | ${`/api/v2/resource/resourceId1/history?limit=20`}
  ${"resourceId1"} | ${undefined}                       | ${"undefined"} | ${"100"} | ${""}                                               | ${`/api/v2/resource/resourceId1/history?limit=100`}
  ${"resourceId1"} | ${{ name: "date", order: "asc" }}  | ${"date.asc"}  | ${"100"} | ${""}                                               | ${`/api/v2/resource/resourceId1/history?limit=100&sort=date.asc`}
  ${"resourceId1"} | ${{ name: "date", order: "desc" }} | ${"date.desc"} | ${"20"}  | ${""}                                               | ${`/api/v2/resource/resourceId1/history?limit=20&sort=date.desc`}
  ${"resourceId1"} | ${{ name: "date", order: "desc" }} | ${"date.desc"} | ${"20"}  | ${"start=2023-12-13T08%3A33%3A15.180818%2B00%3A00"} | ${`/api/v2/resource/resourceId1/history?limit=20&sort=date.desc&start=2023-12-13T08%3A33%3A15.180818%2B00%3A00`}
`(
  "getUrl returns correct url for resource history with sort: $sortTxt, currentPage: $currentPage and pageSize: $pageSize",
  ({ resourceId, sort, pageSize, url, currentPage }) => {
    const query: Query.SubQuery<"GetResourceHistory"> = {
      kind: "GetResourceHistory",
      id: resourceId,
      pageSize: PageSize.from(pageSize),
      sort,
      currentPage: { kind: "CurrentPage", value: currentPage },
    };
    expect(getUrl(query)).toEqual(url);
  },
);
