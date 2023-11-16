import qs from "qs";
import { Query } from "@/Core";

export function getUrl({
  filter,
  pageSize,
  sort,
  currentPage,
}: Query.SubQuery<"GetResources">): string {
  const filterParam =
    filter && Object.keys(filter).length > 0
      ? `&${qs.stringify(
          {
            filter: {
              agent: filter.agent,
              status: filter.status,
              resource_type: filter.type,
              resource_id_value: filter.value,
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
  return `/api/v2/resource?deploy_summary=True&limit=${pageSize.value}${filterParam}${sortParam}${currentPageParams}`;
}
