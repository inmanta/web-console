import { Query } from "@/Core";

export function getUrl({
  pageSize,
}: Query.SubQuery<"LatestReleasedResources">): string {
  const limitParam = pageSize ? `?limit=${pageSize}` : "";
  return `/api/v2/resource${limitParam}`;
}
