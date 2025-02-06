import { capitalize } from "@patternfly/react-core";
import qs from "qs";
import { Sort } from "@/Core";
import {
  ServiceInstanceParams,
  Filter,
} from "@/Core/Domain/ServiceInstanceParams";

export interface UrlParams extends ServiceInstanceParams {
  name: string;
}

export function getUrl(
  { name, filter, sort, pageSize, currentPage }: UrlParams,
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

const filterToRaw = (filter: Filter) => {
  if (typeof filter === "undefined") return {};
  const {
    state,
    deleted,
    attributeSetEmpty: attribute_set_empty,
    attributeSetNotEmpty: attribute_set_not_empty,
    id_or_service_identity,
  } = filter;

  return {
    state,
    deleted: deleted === "Only" ? true : undefined,
    attribute_set_empty,
    attribute_set_not_empty,
    id_or_service_identity,
  };
};
