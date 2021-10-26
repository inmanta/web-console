import { Query, Sort } from "@/Core";
import qs from "qs";

export function getUrl({
  name,
  filter,
  sort,
  pageSize,
}: Query.SubQuery<"GetServiceInstances">): string {
  const filterParam = filter
    ? `&${qs.stringify(
        { filter: filterToRaw(filter) },
        { allowDots: true, arrayFormat: "repeat" }
      )}`
    : "";
  const sortParam = sort ? `&sort=${Sort.serialize(sort)}` : "";
  const includeDeletedParam =
    filter?.deleted === "Include" ? "&include_deleted=true" : "";
  return `/lsm/v1/service_inventory/${name}?include_deployment_progress=True&limit=${pageSize.value}${filterParam}${sortParam}${includeDeletedParam}`;
}

type Filter = NonNullable<Query.SubQuery<"GetServiceInstances">["filter"]>;

const filterToRaw = (filter: Filter) => {
  if (typeof filter === "undefined") return {};
  const {
    id,
    state,
    deleted,
    attributeSetEmpty: attribute_set_empty,
    attributeSetNotEmpty: attribute_set_not_empty,
    identity,
  } = filter;

  const identityAttribute = identity ? { [identity.key]: identity.value } : {};

  return {
    id,
    state,
    deleted: deleted === "Only" ? true : undefined,
    attribute_set_empty,
    attribute_set_not_empty,
    ...identityAttribute,
  };
};
