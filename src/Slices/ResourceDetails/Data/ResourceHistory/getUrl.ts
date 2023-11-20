import { Query } from "@/Core";

export function getUrl({
  id,
  pageSize,
  sort,
  currentPage,
}: Query.SubQuery<"GetResourceHistory">): string {
  const sortParam = sort ? `&sort=${sort.name}.${sort.order}` : "";
  const currentPageParams =
    currentPage.value && currentPage.value.length > 0
      ? `&${decodeURIComponent(currentPage.value.join("&"))}`
      : "";
  return `/api/v2/resource/${id}/history?limit=${pageSize.value}${sortParam}${currentPageParams}`;
}
