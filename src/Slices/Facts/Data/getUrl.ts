import qs from "qs";
import { Query } from "@/Core";

export function getUrl({
  filter,
  pageSize,
  sort,
  currentPage,
}: Query.SubQuery<"GetFacts">): string {
  const filterParam =
    filter && Object.keys(filter).length > 0
      ? `&${qs.stringify(
          {
            filter: {
              name: filter.name,
              resource_id: filter.resource_id,
            },
          },
          { allowDots: true, arrayFormat: "repeat" },
        )}`
      : "";
  const sortParam = sort ? `&sort=${sort.name}.${sort.order}` : "";

  return `/api/v2/facts?limit=${pageSize.value}${filterParam}${sortParam}${currentPage.value}`;
}
