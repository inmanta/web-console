import { PageSize, Query } from "@/Core";
import { getUrl } from "./getUrl";

describe("getUrl for facts", () => {
  it.each`
    filter                          | sort                                      | size    | url
    ${undefined}                    | ${undefined}                              | ${"20"} | ${`/api/v2/facts?limit=20`}
    ${{}}                           | ${undefined}                              | ${"10"} | ${`/api/v2/facts?limit=10`}
    ${{}}                           | ${{ name: "resource_id", order: "desc" }} | ${"10"} | ${`/api/v2/facts?limit=10&sort=resource_id.desc`}
    ${{ resource_id: ["abc123"] }}  | ${undefined}                              | ${"10"} | ${`/api/v2/facts?limit=10&filter.resource_id=abc123`}
    ${{ name: ["fact1", "fact2"] }} | ${{ name: "name", order: "asc" }}         | ${"10"} | ${`/api/v2/facts?limit=10&filter.name=fact1&filter.name=fact2&sort=name.asc`}
  `(
    "returns correct url $url page size $size",
    ({ filter, sort, size, url }) => {
      const query: Query.SubQuery<"GetFacts"> = {
        kind: "GetFacts",
        pageSize: PageSize.from(size),
        filter,
        sort,
      };

      expect(getUrl(query)).toEqual(url);
    },
  );
});
