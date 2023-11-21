import qs from "qs";
import { Query } from "@/Core";
import { composeCurrentPageParams } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";

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
  const currentPageParams = composeCurrentPageParams(currentPage);

  return `/api/v2/desiredstate/${version}?limit=${pageSize.value}${filterParam}${sortParam}${currentPageParams}`;
}
