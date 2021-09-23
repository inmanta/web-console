import { Query } from "@/Core";

export function getUrl({
  pageSize,
  sort,
}: Query.SubQuery<"CompileReports">): string {
  const sortParam = sort ? `&sort=${sort.name}.${sort.order}` : "";
  return `/api/v2/compilereport?limit=${pageSize.value}${sortParam}`;
}
