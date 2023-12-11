import { PageSize, Query } from "@/Core";
import { initialCurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { getUrl } from "./getUrl";

describe("getUrl for facts", () => {
  it.each`
    filter                          | sort                                      | size     | url
    ${undefined}                    | ${undefined}                              | ${"20"}  | ${`/api/v2/facts?limit=20`}
    ${{}}                           | ${undefined}                              | ${"50"}  | ${`/api/v2/facts?limit=50`}
    ${{}}                           | ${{ name: "resource_id", order: "desc" }} | ${"50"}  | ${`/api/v2/facts?limit=50&sort=resource_id.desc`}
    ${{ resource_id: ["abc123"] }}  | ${undefined}                              | ${"50"}  | ${`/api/v2/facts?limit=50&filter.resource_id=abc123`}
    ${{ name: ["fact1", "fact2"] }} | ${{ name: "name", order: "asc" }}         | ${"100"} | ${`/api/v2/facts?limit=100&filter.name=fact1&filter.name=fact2&sort=name.asc`}
  `(
    "returns correct url $url page size $size",
    ({ filter, sort, size, url }) => {
      const query: Query.SubQuery<"GetFacts"> = {
        kind: "GetFacts",
        pageSize: PageSize.from(size),
        filter,
        sort,
        currentPage: initialCurrentPage,
      };

      expect(getUrl(query)).toEqual(url);
    },
  );
});
