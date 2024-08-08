import { PageSize, Query } from "@/Core";
import { getUrl } from "./getUrl";

it.each`
  sort                                     | pageSize | currentPage | url
  ${undefined}                             | ${"20"}  | ${""}       | ${`/lsm/v2/order?limit=20`}
  ${{ name: "created_at", order: "asc" }}  | ${"50"}  | ${""}       | ${`/lsm/v2/order?limit=50&sort=created_at.asc`}
  ${{ name: "created_at", order: "desc" }} | ${"50"}  | ${""}       | ${`/lsm/v2/order?limit=50&sort=created_at.desc`}
`(
  "getUrl returns correct url for orders with currentPage: $currentPage and pageSize: $pageSize",
  ({ pageSize, sort, url, currentPage }) => {
    const query: Query.SubQuery<"GetOrders"> = {
      kind: "GetOrders",
      pageSize: PageSize.from(pageSize),
      sort,
      currentPage: { kind: "CurrentPage", value: currentPage },
    };
    expect(getUrl(query)).toEqual(url);
  },
);
