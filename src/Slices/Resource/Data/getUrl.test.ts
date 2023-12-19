import { PageSize, Query } from "@/Core";
import { getUrl } from "./getUrl";

describe("getUrl for latest released resources ", () => {
  it.each`
    filter                               | sort                                        | size    | currentPage                                         | url
    ${undefined}                         | ${undefined}                                | ${"20"} | ${""}                                               | ${`/api/v2/resource?deploy_summary=True&limit=20`}
    ${{}}                                | ${undefined}                                | ${"50"} | ${""}                                               | ${`/api/v2/resource?deploy_summary=True&limit=50`}
    ${{ agent: ["agent1", "internal"] }} | ${{ name: "resource_type", order: "asc" }}  | ${"50"} | ${""}                                               | ${`/api/v2/resource?deploy_summary=True&limit=50&filter.agent=agent1&filter.agent=internal&sort=resource_type.asc`}
    ${{}}                                | ${{ name: "resource_type", order: "desc" }} | ${"50"} | ${""}                                               | ${`/api/v2/resource?deploy_summary=True&limit=50&sort=resource_type.desc`}
    ${{ status: ["deployed"] }}          | ${{ name: "status", order: "desc" }}        | ${"50"} | ${""}                                               | ${`/api/v2/resource?deploy_summary=True&limit=50&filter.status=deployed&sort=status.desc`}
    ${{}}                                | ${{ name: "resource_type", order: "desc" }} | ${"50"} | ${"start=2023-12-13T08%3A33%3A15.180818%2B00%3A00"} | ${`/api/v2/resource?deploy_summary=True&limit=50&sort=resource_type.desc&start=2023-12-13T08%3A33%3A15.180818%2B00%3A00`}
  `(
    "returns correct url $url page size $size currentPage $currentPage",
    ({ filter, sort, size, url, currentPage }) => {
      const query: Query.SubQuery<"GetResources"> = {
        kind: "GetResources",
        pageSize: PageSize.from(size),
        filter,
        sort,
        currentPage: { kind: "CurrentPage", value: currentPage },
      };

      expect(getUrl(query)).toEqual(url);
    },
  );
});
