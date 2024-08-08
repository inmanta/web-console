import { PageSize, Query } from "@/Core";
import { getUrl } from "./getUrl";

it.each`
  filter                 | currentPage                                         | pageSize | url
  ${undefined}           | ${""}                                               | ${"20"}  | ${`/api/v2/notification?limit=20`}
  ${{ title: ["abcd"] }} | ${""}                                               | ${"50"}  | ${`/api/v2/notification?limit=50&filter.title=abcd`}
  ${{ title: ["abcd"] }} | ${"start=2023-12-13T08%3A33%3A15.180818%2B00%3A00"} | ${"50"}  | ${`/api/v2/notification?limit=50&filter.title=abcd&start=2023-12-13T08%3A33%3A15.180818%2B00%3A00`}
`(
  "getUrl returns correct url for agents with filter $filter, currentPage: $currentPage, and pageSize: $pageSize",
  ({ filter, pageSize, url, currentPage }) => {
    const query: Query.SubQuery<"GetNotifications"> = {
      origin: "center",
      kind: "GetNotifications",
      pageSize: PageSize.from(pageSize),
      filter,
      currentPage: { kind: "CurrentPage", value: currentPage },
    };
    expect(getUrl(query)).toEqual(url);
  },
);
