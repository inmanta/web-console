import { Query } from "@/Core";

export function getUrl({
  reportId,
}: Query.SubQuery<"GetDryRunReport">): string {
  return `/api/v2/dryrun/${reportId}`;
}
