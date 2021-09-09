import { Query } from "@/Core";

export function getUrl({
  id,
  pageSize,
}: Query.SubQuery<"ResourceLogs">): string {
  return `/api/v2/resource/${id}/logs?limit=${pageSize.value}`;
}
