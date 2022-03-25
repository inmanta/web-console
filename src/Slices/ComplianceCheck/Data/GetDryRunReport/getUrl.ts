import { Query } from "@/Core";

export function getUrl({
  version,
  reportId,
}: Query.SubQuery<"GetDryRunReport">): string {
  return `/api/v2/dryrun/${version}/${reportId}`;
}
