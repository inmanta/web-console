import { Query } from "@/Core";
import { getUrl } from "./getUrl";

describe("getUrl for events ", () => {
  const name = "service_a";
  const id = "id1";
  const baseQualifier: Query.Qualifier<"Events"> = {
    service_entity: name,
    id,
    filter: undefined,
    sort: undefined,
    pageSize: 20,
  };
  it.each`
    filter                            | sort                                   | pageSize | url
    ${undefined}                      | ${undefined}                           | ${20}    | ${`/lsm/v1/service_inventory/${name}/${id}/events?limit=20`}
    ${{ source: ["up", "creating"] }} | ${undefined}                           | ${20}    | ${`/lsm/v1/service_inventory/${name}/${id}/events?limit=20&filter.source=up&filter.source=creating`}
    ${undefined}                      | ${{ name: "timestamp", order: "asc" }} | ${10}    | ${`/lsm/v1/service_inventory/${name}/${id}/events?limit=10&sort=timestamp.asc`}
    ${{ source: ["up", "creating"] }} | ${{ name: "timestamp", order: "asc" }} | ${5}     | ${`/lsm/v1/service_inventory/${name}/${id}/events?limit=5&sort=timestamp.asc&filter.source=up&filter.source=creating`}
    ${{ source: ["up", "creating"] }} | ${{ name: "timestamp", order: "asc" }} | ${20}    | ${`/lsm/v1/service_inventory/${name}/${id}/events?limit=20&sort=timestamp.asc&filter.source=up&filter.source=creating`}
    ${undefined}                      | ${{ name: "timestamp", order: "asc" }} | ${20}    | ${`/lsm/v1/service_inventory/${name}/${id}/events?limit=20&sort=timestamp.asc`}
    ${{}}                             | ${{ name: "timestamp", order: "asc" }} | ${20}    | ${`/lsm/v1/service_inventory/${name}/${id}/events?limit=20&sort=timestamp.asc`}
  `(
    "returns correct url $url for filter $filter sort $sort and page size $pageSize",
    ({ filter, sort, pageSize, url }) => {
      const query: Query.SubQuery<"Events"> = {
        kind: "Events",
        qualifier: {
          ...baseQualifier,
          filter,
          sort,
          pageSize,
        },
      };

      expect(getUrl(query)).toEqual(url);
    }
  );
});
