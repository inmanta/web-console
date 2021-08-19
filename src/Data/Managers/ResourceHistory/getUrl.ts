import { Query } from "@/Core";

export function getUrl({
  id,
  pageSize,
  sort,
}: Query.SubQuery<"ResourceHistory">): string {
  const sortParam = sort ? `&sort=${sort.name}.${sort.order}` : "";
  return `/api/v2/resource/${id}/history?limit=${pageSize.value}${sortParam}`;
}
