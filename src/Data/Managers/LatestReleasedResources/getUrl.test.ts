import { Query } from "@/Core";
import { getUrl } from "./getUrl";

describe("getUrl for latest released resources ", () => {
  const baseQuery: Query.SubQuery<"LatestReleasedResources"> = {
    kind: "LatestReleasedResources",
    pageSize: 20,
  };
  it.each`
    pageSize | url
    ${20}    | ${`/api/v2/resource?limit=20`}
    ${10}    | ${`/api/v2/resource?limit=10`}
  `("returns correct url $url page size $pageSize", ({ pageSize, url }) => {
    const query: Query.SubQuery<"LatestReleasedResources"> = {
      ...baseQuery,
      pageSize,
    };

    expect(getUrl(query)).toEqual(url);
  });
});
