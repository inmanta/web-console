import { Query } from "@/Core";
import { getUrl } from "./getUrl";

describe("getUrl for latest released resources ", () => {
  const baseQuery: Query.SubQuery<"ResourceHistory"> = {
    kind: "ResourceHistory",
    pageSize: 20,
    id: "resourceId1",
  };
  it.each`
    sort                               | pageSize | url
    ${undefined}                       | ${20}    | ${`/api/v2/resource/resourceId1/history?limit=20`}
    ${undefined}                       | ${10}    | ${`/api/v2/resource/resourceId1/history?limit=10`}
    ${{ name: "date", order: "asc" }}  | ${10}    | ${`/api/v2/resource/resourceId1/history?limit=10&sort=date.asc`}
    ${{ name: "date", order: "desc" }} | ${20}    | ${`/api/v2/resource/resourceId1/history?limit=20&sort=date.desc`}
  `(
    "returns correct url $url page size $pageSize",
    ({ sort, pageSize, url }) => {
      const query: Query.SubQuery<"ResourceHistory"> = {
        ...baseQuery,
        pageSize,
        sort,
      };

      expect(getUrl(query)).toEqual(url);
    }
  );
});
