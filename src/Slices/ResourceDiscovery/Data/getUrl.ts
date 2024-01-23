import qs from "qs";
import { Query } from "@/Core";

export function getUrl({
  filter,
  pageSize,
  sort,
  currentPage,
}: Query.SubQuery<"GetDiscoveredResources">): string {
  const filterParam =
    filter && Object.keys(filter).length > 0
      ? `&${qs.stringify(
          {
            filter: {
              discovered_resource_id: filter.discovered_resource_id,
            },
          },
          { allowDots: true, arrayFormat: "repeat" },
        )}`
      : "";
  const sortParam = sort ? `&sort=${sort.name}.${sort.order}` : "";

  return `/api/v2/discovered?limit=${pageSize.value}${filterParam}${sortParam}${
    currentPage.value ? `&${currentPage.value}` : ""
  }`;
}
