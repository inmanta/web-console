import { Query } from "@/Core";
import qs from "qs";

export function getUrl({
  filter,
  pageSize,
  sort,
}: Query.SubQuery<"LatestReleasedResources">): string {
  const filterParam =
    filter && Object.keys(filter).length > 0
      ? `&${qs.stringify(
          {
            filter: {
              agent: filter.agent,
              status: filter.status,
              resource_type: filter.type,
              resource_id_value: filter.value,
            },
          },
          { allowDots: true, arrayFormat: "repeat" }
        )}`
      : "";
  const limitParam = pageSize ? `?limit=${pageSize}` : "";
  const sortParam = sort ? `&sort=${sort.name}.${sort.order}` : "";
  return `/api/v2/resource${limitParam}${filterParam}${sortParam}`;
}
