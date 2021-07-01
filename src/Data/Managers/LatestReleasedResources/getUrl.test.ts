import { Query } from "@/Core";
import { getUrl } from "./getUrl";

describe("getUrl for latest released resources ", () => {
  const baseQuery: Query.SubQuery<"LatestReleasedResources"> = {
    kind: "LatestReleasedResources",
    pageSize: 20,
  };
  it.each`
    sort                                        | pageSize | url
    ${undefined}                                | ${20}    | ${`/api/v2/resource?limit=20`}
    ${undefined}                                | ${10}    | ${`/api/v2/resource?limit=10`}
    ${{ name: "resource_type", order: "asc" }}  | ${10}    | ${`/api/v2/resource?limit=10&sort=resource_type.asc`}
    ${{ name: "resource_type", order: "desc" }} | ${10}    | ${`/api/v2/resource?limit=10&sort=resource_type.desc`}
    ${{ name: "status", order: "desc" }}        | ${10}    | ${`/api/v2/resource?limit=10&sort=status.desc`}
  `(
    "returns correct url $url page size $pageSize",
    ({ sort, pageSize, url }) => {
      const query: Query.SubQuery<"LatestReleasedResources"> = {
        ...baseQuery,
        pageSize,
        sort,
      };

      expect(getUrl(query)).toEqual(url);
    }
  );
});
