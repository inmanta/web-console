import qs from "qs";
import { Query, Sort } from "@/Core";

export function getUrl({
  pageSize,
  sort,
  filter,
  currentPage,
}: Query.SubQuery<"GetAgents">): string {
  const filterParam =
    filter && Object.keys(filter).length > 0
      ? `&${qs.stringify(
          {
            filter: {
              name: filter.name,
              process_name: filter.process_name,
              status: filter.status,
            },
          },
          { allowDots: true, arrayFormat: "repeat" },
        )}`
      : "";
  const sortParam = sort ? `&sort=${Sort.serialize(sort)}` : "";
  const currentPageParams =
    currentPage.value && currentPage.value.length > 0
      ? `&${decodeURIComponent(currentPage.value.join("&"))}`
      : "";

  return `/api/v2/agents?limit=${pageSize.value}${filterParam}${sortParam}${currentPageParams}`;
}
