import { PageSize, Query } from "@/Core";
import { getUrl } from "./getUrl";

describe("getUrl for facts", () => {
  it.each`
    filter                          | sort                                      | size     | currentPage                                         | url
    ${undefined}                    | ${undefined}                              | ${"20"}  | ${""}                                               | ${`/api/v2/facts?limit=20`}
    ${{}}                           | ${undefined}                              | ${"50"}  | ${""}                                               | ${`/api/v2/facts?limit=50`}
    ${{}}                           | ${{ name: "resource_id", order: "desc" }} | ${"50"}  | ${""}                                               | ${`/api/v2/facts?limit=50&sort=resource_id.desc`}
    ${{ resource_id: ["abc123"] }}  | ${undefined}                              | ${"50"}  | ${""}                                               | ${`/api/v2/facts?limit=50&filter.resource_id=abc123`}
    ${{ name: ["fact1", "fact2"] }} | ${{ name: "name", order: "asc" }}         | ${"100"} | ${""}                                               | ${`/api/v2/facts?limit=100&filter.name=fact1&filter.name=fact2&sort=name.asc`}
    ${{}}                           | ${undefined}                              | ${"50"}  | ${"start=2023-12-13T08%3A33%3A15.180818%2B00%3A00"} | ${`/api/v2/facts?limit=50&start=2023-12-13T08%3A33%3A15.180818%2B00%3A00`}
  `(
    "returns correct url $url page size $size currentPage $currentPage",
    ({ filter, sort, size, url, currentPage }) => {
      const query: Query.SubQuery<"GetFacts"> = {
        kind: "GetFacts",
        pageSize: PageSize.from(size),
        filter,
        sort,
        currentPage: { kind: "CurrentPage", value: currentPage },
      };

      expect(getUrl(query)).toEqual(url);
    },
  );
});
