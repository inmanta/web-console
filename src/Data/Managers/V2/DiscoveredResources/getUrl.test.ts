import { PageSize } from "@/Core";
import { getUrl } from "./getUrl";
import { GetDiscoveredResourcesParams } from "./useGetDiscoveredResources";

it.each`
  filter                                  | sort                               | pageSize | currentPage | url
  ${undefined}                            | ${undefined}                       | ${"20"}  | ${""}       | ${`/api/v2/discovered?limit=20`}
  ${{}}                                   | ${{ name: "name", order: "asc" }}  | ${"50"}  | ${""}       | ${`/api/v2/discovered?limit=50&sort=name.asc`}
  ${{ discovered_resource_id: ["abcd"] }} | ${{ name: "name", order: "desc" }} | ${"50"}  | ${""}       | ${`/api/v2/discovered?limit=50&filter.discovered_resource_id=abcd&sort=name.desc`}
`(
  "getUrl returns correct url for discovered resources with currentPage: $currentPage and pageSize: $pageSize",
  ({ filter, pageSize, sort, url, currentPage }) => {
    const query: GetDiscoveredResourcesParams = {
      pageSize: PageSize.from(pageSize),
      filter,
      sort,
      currentPage: { kind: "CurrentPage", value: currentPage },
    };

    expect(getUrl(query)).toEqual(url);
  },
);
