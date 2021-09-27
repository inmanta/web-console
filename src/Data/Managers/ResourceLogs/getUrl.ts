import { Query } from "@/Core";
import qs from "qs";

export function getUrl({
  id,
  filter,
  pageSize,
}: Query.SubQuery<"ResourceLogs">): string {
  const filterParam =
    filter && Object.keys(filter).length > 0
      ? `&${qs.stringify(
          {
            filter: {
              minimal_log_level: filter.minimal_log_level,
              action: filter.action,
              message: filter.message,
            },
          },
          { allowDots: true, arrayFormat: "repeat" }
        )}`
      : "";
  return `/api/v2/resource/${id}/logs?limit=${pageSize.value}${filterParam}`;
}
