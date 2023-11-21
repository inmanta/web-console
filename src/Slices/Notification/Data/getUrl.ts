import qs from "qs";
import { Query } from "@/Core";
import { composeCurrentPageParams } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";

export function getUrl({
  filter,
  pageSize,
  currentPage,
}: Query.SubQuery<"GetNotifications">): string {
  const filterParam =
    filter && Object.keys(filter).length > 0
      ? `&${qs.stringify(
          {
            filter: {
              title: filter.title,
              message: filter.message,
              read: filter.read,
              cleared: filter.cleared,
              severity: filter.severity,
            },
          },
          { allowDots: true, arrayFormat: "repeat" },
        )}`
      : "";
  const currentPageParams = composeCurrentPageParams(currentPage);
  return `/api/v2/notification?limit=${pageSize.value}${filterParam}${currentPageParams}`;
}
