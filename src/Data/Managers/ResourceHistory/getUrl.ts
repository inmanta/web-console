import { Query } from "@/Core";

export function getUrl({
  id,
  pageSize,
  sort,
}: Query.SubQuery<"GetResourceHistory">): string {
  const sortParam = sort ? `&sort=${sort.name}.${sort.order}` : "";
  return `/api/v2/resource/${encodeURIComponent(id)}/history?limit=${
    pageSize.value
  }${sortParam}`;
}
