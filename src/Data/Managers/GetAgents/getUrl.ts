import qs from "qs";
import { Query } from "@/Core";

export function getUrl({
  pageSize,
  sort,
  filter,
}: Query.SubQuery<"GetAgents">): string {
  const filterParam =
    filter && Object.keys(filter).length > 0
      ? `&${qs.stringify(
          {
            filter: {
              name: filter.name,
              process_name: filter.process_name,
              status: filter.status,
            },
          },
          { allowDots: true, arrayFormat: "repeat" }
        )}`
      : "";
  const sortParam = sort ? `&sort=${sort.name}.${sort.order}` : "";
  return `/api/v2/agents?limit=${pageSize.value}${filterParam}${sortParam}`;
}
