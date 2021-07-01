import { Query } from "@/Core";

export function getUrl({
  pageSize,
  sort,
}: Query.SubQuery<"LatestReleasedResources">): string {
  const limitParam = pageSize ? `?limit=${pageSize}` : "";
  const sortParam = sort ? `&sort=${sort.name}.${sort.order}` : "";
  return `/api/v2/resource${limitParam}${sortParam}`;
}
