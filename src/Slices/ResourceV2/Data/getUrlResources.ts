import { Query } from "@/Core";

export function getUrl({}: Query.SubQuery<"GetResourcesV2">): string {
  return `/api/v2/resource?deploy_summary=True&`;
}
