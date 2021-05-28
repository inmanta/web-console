import { Query } from "@/Core";
import moment from "moment";
import { getUrl } from "./getUrl";

describe("getUrl for events ", () => {
  const name = "service_a";
  const id = "id1";
  const baseQuery: Query.SubQuery<"Events"> = {
    kind: "Events",
    service_entity: name,
    id,
    filter: undefined,
    sort: undefined,
    pageSize: 20,
  };
  it.each`
    filter                                                                                                                                    | sort                                   | pageSize | url
    ${undefined}                                                                                                                              | ${undefined}                           | ${20}    | ${`/lsm/v1/service_inventory/${name}/${id}/events?limit=20`}
    ${{ source: ["up", "creating"] }}                                                                                                         | ${undefined}                           | ${20}    | ${`/lsm/v1/service_inventory/${name}/${id}/events?limit=20&filter.source=up&filter.source=creating`}
    ${undefined}                                                                                                                              | ${{ name: "timestamp", order: "asc" }} | ${10}    | ${`/lsm/v1/service_inventory/${name}/${id}/events?limit=10&sort=timestamp.asc`}
    ${{ source: ["up", "creating"] }}                                                                                                         | ${{ name: "timestamp", order: "asc" }} | ${5}     | ${`/lsm/v1/service_inventory/${name}/${id}/events?limit=5&sort=timestamp.asc&filter.source=up&filter.source=creating`}
    ${{ source: ["up", "creating"] }}                                                                                                         | ${{ name: "timestamp", order: "asc" }} | ${20}    | ${`/lsm/v1/service_inventory/${name}/${id}/events?limit=20&sort=timestamp.asc&filter.source=up&filter.source=creating`}
    ${undefined}                                                                                                                              | ${{ name: "timestamp", order: "asc" }} | ${20}    | ${`/lsm/v1/service_inventory/${name}/${id}/events?limit=20&sort=timestamp.asc`}
    ${{}}                                                                                                                                     | ${{ name: "timestamp", order: "asc" }} | ${20}    | ${`/lsm/v1/service_inventory/${name}/${id}/events?limit=20&sort=timestamp.asc`}
    ${{ timestamp: [{ operator: "less than", date: moment.tz("2021-04-28+01:30 CEST", "YYYY-MM-DD+HH:mm z", "Europe/Brussels").toDate() }] }} | ${{ name: "timestamp", order: "asc" }} | ${20}    | ${`/lsm/v1/service_inventory/${name}/${id}/events?limit=20&sort=timestamp.asc&filter.timestamp=lt%3A2021-04-27%2B23%3A30%3A00`}
  `(
    "returns correct url $url for filter $filter sort $sort and page size $pageSize",
    ({ filter, sort, pageSize, url }) => {
      const query: Query.SubQuery<"Events"> = {
        ...baseQuery,
        filter,
        sort,
        pageSize,
      };

      expect(getUrl(query, "Europe/Brussels")).toEqual(url);
    }
  );
});
