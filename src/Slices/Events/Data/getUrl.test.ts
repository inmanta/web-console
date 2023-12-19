import moment from "moment";
import { Query, PageSize } from "@/Core";
import { getUrl } from "./getUrl";

describe("getUrl for events ", () => {
  const name = "service_a";
  const id = "id1";

  it.each`
    filter                                                                                                                               | sort                                   | size     | currentPage                                         | url
    ${undefined}                                                                                                                         | ${undefined}                           | ${"20"}  | ${""}                                               | ${`/lsm/v1/service_inventory/${name}/${id}/events?limit=20`}
    ${{ source: ["up", "creating"] }}                                                                                                    | ${undefined}                           | ${"20"}  | ${""}                                               | ${`/lsm/v1/service_inventory/${name}/${id}/events?limit=20&filter.source=up&filter.source=creating`}
    ${undefined}                                                                                                                         | ${{ name: "timestamp", order: "asc" }} | ${"100"} | ${""}                                               | ${`/lsm/v1/service_inventory/${name}/${id}/events?limit=100&sort=timestamp.asc`}
    ${{ source: ["up", "creating"] }}                                                                                                    | ${{ name: "timestamp", order: "asc" }} | ${"50"}  | ${""}                                               | ${`/lsm/v1/service_inventory/${name}/${id}/events?limit=50&sort=timestamp.asc&filter.source=up&filter.source=creating`}
    ${{ source: ["up", "creating"] }}                                                                                                    | ${{ name: "timestamp", order: "asc" }} | ${"20"}  | ${""}                                               | ${`/lsm/v1/service_inventory/${name}/${id}/events?limit=20&sort=timestamp.asc&filter.source=up&filter.source=creating`}
    ${undefined}                                                                                                                         | ${{ name: "timestamp", order: "asc" }} | ${"20"}  | ${""}                                               | ${`/lsm/v1/service_inventory/${name}/${id}/events?limit=20&sort=timestamp.asc`}
    ${{}}                                                                                                                                | ${{ name: "timestamp", order: "asc" }} | ${"20"}  | ${""}                                               | ${`/lsm/v1/service_inventory/${name}/${id}/events?limit=20&sort=timestamp.asc`}
    ${{ timestamp: [{ operator: "from", date: moment.tz("2021-04-28+01:30 CEST", "YYYY-MM-DD+HH:mm z", "Europe/Brussels").toDate() }] }} | ${{ name: "timestamp", order: "asc" }} | ${"20"}  | ${""}                                               | ${`/lsm/v1/service_inventory/${name}/${id}/events?limit=20&sort=timestamp.asc&filter.timestamp=ge%3A2021-04-27%2B23%3A30%3A00`}
    ${{}}                                                                                                                                | ${{ name: "timestamp", order: "asc" }} | ${"20"}  | ${"start=2023-12-13T08%3A33%3A15.180818%2B00%3A00"} | ${`/lsm/v1/service_inventory/${name}/${id}/events?limit=20&sort=timestamp.asc&start=2023-12-13T08%3A33%3A15.180818%2B00%3A00`}
  `(
    "returns correct url $url for filter $filter sort $sort, currentPage: $currentPage and page size $size",
    ({ filter, sort, size, url, currentPage }) => {
      const query: Query.SubQuery<"GetInstanceEvents"> = {
        kind: "GetInstanceEvents",
        service_entity: name,
        id,
        filter,
        sort,
        pageSize: PageSize.from(size),
        currentPage: { kind: "CurrentPage", value: currentPage },
      };

      expect(getUrl(query, "Europe/Brussels")).toEqual(url);
    },
  );
});
