import { Query } from "@/Core";

export function getUrl({
  pageSize,
  sort,
}: Query.SubQuery<"GetResourcesV2">): string {
  const sortParam = sort ? `&sort=${sort.name}.${sort.order}` : "";
  return `/api/v2/resource?deploy_summary=True&limit=${pageSize.value}${sortParam}`;
}
