import { capitalize } from "@patternfly/react-core";
import qs from "qs";
import { Query, Sort } from "@/Core";

export function getUrl(
  {
    name,
    filter,
    sort,
    pageSize,
    currentPage,
  }: Query.SubQuery<"GetServiceInstances">,
  includeDeploymentProgress = true,
): string {
  const filterParam = filter
    ? `&${qs.stringify(
        { filter: filterToRaw(filter) },
        { allowDots: true, arrayFormat: "repeat" },
      )}`
    : "";
  const sortParam = sort ? `&sort=${Sort.serialize(sort)}` : "";
  const includeDeletedParam =
    filter?.deleted === "Include" ? "&include_deleted=true" : "";

  return `/lsm/v1/service_inventory/${name}?include_deployment_progress=${capitalize(
    includeDeploymentProgress.toString(),
  )}&limit=${pageSize.value}${filterParam}${sortParam}${includeDeletedParam}${
    currentPage.value ? `&${currentPage.value}` : ""
  }`;
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
