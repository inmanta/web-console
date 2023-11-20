import qs from "qs";
import { Query } from "@/Core";

export function getUrl({
  version,
  sort,
  filter,
  pageSize,
  currentPage,
}: Query.SubQuery<"GetVersionResources">): string {
  const filterParam =
    filter && Object.keys(filter).length > 0
      ? `&${qs.stringify(
          {
            filter: {
              agent: filter.agent,
              resource_id_value: filter.value,
              resource_type: filter.type,
            },
          },
          { allowDots: true, arrayFormat: "repeat" },
        )}`
      : "";
  const sortParam = sort ? `&sort=${sort.name}.${sort.order}` : "";
  const currentPageParams =
    currentPage.value && currentPage.value.length > 0
      ? `&${decodeURIComponent(currentPage.value.join("&"))}`
      : "";

  return `/api/v2/desiredstate/${version}?limit=${pageSize.value}${filterParam}${sortParam}${currentPageParams}`;
}
