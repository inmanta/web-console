import { PageSize, Query } from "@/Core";
import { getUrl } from "./getUrl";

it.each`
  filter              | filterTxt      | pageSize | url
  ${undefined}        | ${"undefined"} | ${"20"}  | ${`/api/v2/desiredstate/123?limit=20`}
  ${undefined}        | ${"undefined"} | ${"10"}  | ${`/api/v2/desiredstate/123?limit=10`}
  ${{ agent: "aws" }} | ${"agent=aws"} | ${"20"}  | ${`/api/v2/desiredstate/123?limit=20&filter.agent=aws`}
`(
  "getUrl returns correct url for resource logs with filter: $filterTxt and pageSize: $pageSize",
  ({ filter, pageSize, url }) => {
    const query: Query.SubQuery<"GetVersionResources"> = {
      kind: "GetVersionResources",
      version: "123",
      pageSize: PageSize.from(pageSize),
      filter,
    };
    expect(getUrl(query)).toEqual(url);
  }
);
