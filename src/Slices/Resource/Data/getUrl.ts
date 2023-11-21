import qs from "qs";
import { Query } from "@/Core";
import { composeCurrentPageParams } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";

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
  const currentPageParams = composeCurrentPageParams(currentPage);
  return `/api/v2/resource?deploy_summary=True&limit=${pageSize.value}${filterParam}${sortParam}${currentPageParams}`;
}
