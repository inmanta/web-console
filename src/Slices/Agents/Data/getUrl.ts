import qs from "qs";
import { Query, Sort } from "@/Core";
import { composeCurrentPageParams } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";

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
  const currentPageParams = composeCurrentPageParams(currentPage);

  return `/api/v2/agents?limit=${pageSize.value}${filterParam}${sortParam}${currentPageParams}`;
}
