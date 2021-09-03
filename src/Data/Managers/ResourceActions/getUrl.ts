import { Query } from "@/Core";

export function getUrl({
  agent,
  attribute,
  resource_type,
  resource_id_value,
}: Query.SubQuery<"ResourceActions">): string {
  return `/api/v2/resource_actions?agent=${agent}&attribute=${attribute}&resource_type=${resource_type}&attribute_value=${resource_id_value}`;
}
