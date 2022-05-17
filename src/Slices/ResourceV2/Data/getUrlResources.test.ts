import { PageSize, Query } from "@/Core";
import { getUrl } from "./getUrlResources";

describe("getUrl for latest released resources ", () => {
  it.each`
    sort                                        | size    | url
    ${undefined}                                | ${"20"} | ${`/api/v2/resource?deploy_summary=True&limit=20`}
    ${undefined}                                | ${"10"} | ${`/api/v2/resource?deploy_summary=True&limit=10`}
    ${{ name: "resource_type", order: "asc" }}  | ${"10"} | ${`/api/v2/resource?deploy_summary=True&limit=10&sort=resource_type.asc`}
    ${{ name: "resource_type", order: "desc" }} | ${"10"} | ${`/api/v2/resource?deploy_summary=True&limit=10&sort=resource_type.desc`}
    ${{ name: "status", order: "desc" }}        | ${"10"} | ${`/api/v2/resource?deploy_summary=True&limit=10&sort=status.desc`}
  `("returns correct url $url page size $size", ({ sort, size, url }) => {
    const query: Query.SubQuery<"GetResourcesV2"> = {
      kind: "GetResourcesV2",
      pageSize: PageSize.from(size),
      sort,
    };

    expect(getUrl(query)).toEqual(url);
  });
});
