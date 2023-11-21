import { Query } from "@/Core";

export function getUrl({
  id,
  pageSize,
  sort,
  currentPage,
}: Query.SubQuery<"GetResourceHistory">): string {
  const sortParam = sort ? `&sort=${sort.name}.${sort.order}` : "";

  return `/api/v2/resource/${id}/history?limit=${pageSize.value}${sortParam}${currentPage.value}`;
}
