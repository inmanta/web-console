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
  return `/api/v2/agents?limit=${pageSize.value}${filterParam}${sortParam}${
    currentPage.value ? `&${currentPage.value}` : ""
  }`;
}
