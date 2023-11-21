import { Query } from "@/Core";
import { composeCurrentPageParams } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";

export function getUrl({
  id,
  pageSize,
  sort,
  currentPage,
}: Query.SubQuery<"GetResourceHistory">): string {
  const sortParam = sort ? `&sort=${sort.name}.${sort.order}` : "";
  const currentPageParams = composeCurrentPageParams(currentPage);
  return `/api/v2/resource/${id}/history?limit=${pageSize.value}${sortParam}${currentPageParams}`;
}
