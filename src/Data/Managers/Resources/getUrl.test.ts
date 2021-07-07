import { Query } from "@/Core";
import { getUrl } from "./getUrl";

describe("getUrl for latest released resources ", () => {
  const baseQuery: Query.SubQuery<"Resources"> = {
    kind: "Resources",
    pageSize: 20,
  };
  it.each`
    filter                               | sort                                        | pageSize | url
    ${undefined}                         | ${undefined}                                | ${20}    | ${`/api/v2/resource?limit=20`}
    ${{}}                                | ${undefined}                                | ${10}    | ${`/api/v2/resource?limit=10`}
    ${{ agent: ["agent1", "internal"] }} | ${{ name: "resource_type", order: "asc" }}  | ${10}    | ${`/api/v2/resource?limit=10&filter.agent=agent1&filter.agent=internal&sort=resource_type.asc`}
    ${{}}                                | ${{ name: "resource_type", order: "desc" }} | ${10}    | ${`/api/v2/resource?limit=10&sort=resource_type.desc`}
    ${{ status: ["deployed"] }}          | ${{ name: "status", order: "desc" }}        | ${10}    | ${`/api/v2/resource?limit=10&filter.status=deployed&sort=status.desc`}
  `(
    "returns correct url $url page size $pageSize",
    ({ filter, sort, pageSize, url }) => {
      const query: Query.SubQuery<"Resources"> = {
        ...baseQuery,
        pageSize,
        filter,
        sort,
      };

      expect(getUrl(query)).toEqual(url);
    }
  );
});
