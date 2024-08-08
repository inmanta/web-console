import { PageSize, Query } from "@/Core";
import { getUrl } from "./getUrl";

it.each`
  filter              | filterTxt      | pageSize | currentPage                                         | url
  ${undefined}        | ${"undefined"} | ${"20"}  | ${""}                                               | ${`/api/v2/desiredstate/123?limit=20`}
  ${undefined}        | ${"undefined"} | ${"100"} | ${""}                                               | ${`/api/v2/desiredstate/123?limit=100`}
  ${{ agent: "aws" }} | ${"agent=aws"} | ${"20"}  | ${""}                                               | ${`/api/v2/desiredstate/123?limit=20&filter.agent=aws`}
  ${{ agent: "aws" }} | ${"agent=aws"} | ${"20"}  | ${"start=2023-12-13T08%3A33%3A15.180818%2B00%3A00"} | ${`/api/v2/desiredstate/123?limit=20&filter.agent=aws&start=2023-12-13T08%3A33%3A15.180818%2B00%3A00`}
`(
  "getUrl returns correct url for resource logs with filter: $filterTxt, currentPage: $currentPage and pageSize: $pageSize",
  ({ filter, pageSize, url, currentPage }) => {
    const query: Query.SubQuery<"GetVersionResources"> = {
      kind: "GetVersionResources",
      version: "123",
      pageSize: PageSize.from(pageSize),
      filter,
      currentPage: { kind: "CurrentPage", value: currentPage },
    };
    expect(getUrl(query)).toEqual(url);
  },
);
