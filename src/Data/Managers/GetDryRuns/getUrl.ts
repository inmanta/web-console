import { Query } from "@/Core";

export function getUrl({ version }: Query.SubQuery<"GetDryRuns">): string {
  return `/api/v2/dryrun/${version}`;
}
